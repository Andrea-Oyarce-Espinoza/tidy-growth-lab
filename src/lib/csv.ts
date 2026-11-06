import {
  dataSchema,
  metricKeys,
  parseBackup,
  type LabData,
  type Post,
} from "./data";

const columns = [
  "Registro",
  "ID",
  "Título",
  "Formato",
  "Fecha",
  "Descripción",
  "Estado",
  "Alcance",
  "Impresiones",
  "Me gusta",
  "Comentarios",
  "Guardados",
  "Compartidos",
  "Consultas",
  "Clientes",
  "Seguidores iniciales",
  "Fecha inicial",
  "Seguidores actuales",
  "Fecha seguidores",
];
const key = (value: string) =>
  value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const unsafe = (value: string) =>
  /^[\s\u0000-\u001f]*[=+@\-＝＋＠－]/u.test(value) || /^[\t\r\n]/.test(value);
function cell(value: string | number | null) {
  let text = value === null ? "" : String(value);
  if (unsafe(text) || text.startsWith("'")) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}
function textCell(value: string) {
  return value.startsWith("'") && (value[1] === "'" || unsafe(value.slice(1)))
    ? value.slice(1)
    : value;
}

export function exportCsv(input: LabData): string {
  const data = dataSchema.parse(input);
  const account = [
    "Cuenta",
    ...Array(14).fill(""),
    data.baseline.count,
    data.baseline.date,
    data.currentFollowers,
    data.currentFollowersDate,
  ];
  const posts = data.posts.map((p) => [
    "Publicación",
    p.id,
    p.title,
    p.format,
    p.date,
    p.description,
    p.status,
    ...metricKeys.map((m) => p.metrics[m]),
    "",
    "",
    "",
    "",
  ]);
  return (
    "\uFEFF" +
    [columns, account, ...posts]
      .map((row) => row.map(cell).join(";"))
      .join("\r\n") +
    "\r\n"
  );
}

// Quotes may contain separators and line breaks; splitting on lines loses data.
function rowsFromCsv(input: string): string[][] {
  let raw = input.replace(/^\uFEFF/, "");
  const separatorLine = raw.match(/^sep=([;,\t])\r?\n/i);
  if (separatorLine) raw = raw.slice(separatorLine[0].length);
  const header = raw.split(/\r\n|\r|\n/, 1)[0];
  const separator =
    separatorLine?.[1] ??
    [";", ",", "\t"].sort(
      (a, b) => header.split(b).length - header.split(a).length,
    )[0];
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false,
    closed = false;
  function fieldDone() {
    row.push(field);
    field = "";
    closed = false;
    if (row.length > 60)
      throw new Error("La planilla tiene demasiadas columnas.");
  }
  function rowDone() {
    fieldDone();
    if (row.some((v) => v.trim() !== "")) rows.push(row);
    row = [];
    if (rows.length > 5002)
      throw new Error("Puedes importar hasta 5.000 publicaciones.");
  }
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (quoted) {
      if (c === '"') {
        if (raw[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else field += c;
    } else if (c === separator) fieldDone();
    else if (c === "\r" || c === "\n") {
      if (c === "\r" && raw[i + 1] === "\n") i++;
      rowDone();
    } else if (c === '"' && field === "" && !closed) quoted = true;
    else {
      if (closed || c === '"')
        throw new Error(
          "Hay comillas o separadores mal cerrados. Vuelve a guardar la planilla como CSV.",
        );
      field += c;
    }
  }
  if (quoted)
    throw new Error("Hay un texto entre comillas sin cerrar en el CSV.");
  if (field !== "" || row.length || closed) rowDone();
  return rows;
}

function count(value: string, label: string): number | null {
  if (!value.trim()) return null;
  if (!/^\d+$/.test(value.trim()) || !Number.isSafeInteger(Number(value)))
    throw new Error(
      `${label}: usa un número entero sin puntos, comas ni fórmulas.`,
    );
  return Number(value);
}
function date(value: string, label: string): string {
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const local = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (local)
    return `${local[3]}-${local[2].padStart(2, "0")}-${local[1].padStart(2, "0")}`;
  throw new Error(`${label}: usa una fecha AAAA-MM-DD o DD/MM/AAAA.`);
}

export function importCsv(raw: string, current: LabData): LabData {
  const rows = rowsFromCsv(raw);
  if (rows.length < 2)
    throw new Error(
      "El CSV necesita encabezados y al menos una fila. Puedes descargar tu plan como plantilla.",
    );
  const headings = rows[0].map(key);
  if (new Set(headings).size !== headings.length)
    throw new Error("Hay columnas repetidas o sin nombre en el CSV.");
  const known = new Set(columns.map(key));
  const unknown = headings.filter((h) => !known.has(h));
  if (unknown.length)
    throw new Error(
      "Hay columnas desconocidas. Conserva los encabezados de la planilla descargada para evitar perder información.",
    );
  for (const required of ["Título", "Formato", "Fecha"]) {
    if (!headings.includes(key(required)))
      throw new Error(
        `Falta la columna «${required}». Usa la planilla descargada como plantilla.`,
      );
  }
  const get = (row: string[], name: string) =>
    row[headings.indexOf(key(name))] ?? "";
  const posts: Post[] = [];
  let accountFound = false;
  let baseline = { ...current.baseline },
    followers = current.currentFollowers,
    followersDate = current.currentFollowersDate;
  const metadata = columns.slice(15);
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i],
      label = `Fila ${i + 1}`;
    if (row.length !== headings.length)
      throw new Error(
        `${label}: la cantidad de columnas no coincide con los encabezados.`,
      );
    const kind = key(get(row, "Registro")) || "publicacion";
    if (kind === "cuenta") {
      if (accountFound)
        throw new Error("El CSV debe tener una sola fila de Cuenta.");
      accountFound = true;
      for (const name of columns.slice(1, 15))
        if (get(row, name).trim())
          throw new Error(
            `${label}: los datos de publicaciones deben ir en filas de Publicación.`,
          );
      for (const name of metadata)
        if (!headings.includes(key(name)))
          throw new Error(`${label}: falta la columna «${name}».`);
      baseline = {
        count: count(get(row, metadata[0]), label),
        date: date(get(row, metadata[1]), label),
      };
      followers = count(get(row, metadata[2]), label);
      const currentDate = get(row, metadata[3]);
      followersDate = currentDate.trim() ? date(currentDate, label) : null;
      continue;
    }
    if (kind !== "publicacion")
      throw new Error(`${label}: Registro debe ser Cuenta o Publicación.`);
    if (metadata.some((name) => get(row, name).trim()))
      throw new Error(`${label}: coloca los seguidores en una fila de Cuenta.`);
    const format = (
      { carrusel: "Carrusel", reel: "Reel", imagen: "Imagen" } as const
    )[key(get(row, "Formato")) as "carrusel" | "reel" | "imagen"];
    const status =
      (
        {
          idea: "idea",
          enproduccion: "en producción",
          programado: "programado",
          publicado: "publicado",
        } as const
      )[
        key(get(row, "Estado")) as
          "idea" | "enproduccion" | "programado" | "publicado"
      ] ?? (get(row, "Estado").trim() ? undefined : "idea");
    const metrics = Object.fromEntries(
      metricKeys.map((m, index) => [
        m,
        count(get(row, columns[index + 7]), `${label}, ${columns[index + 7]}`),
      ]),
    ) as Post["metrics"];
    const candidate = {
      id: textCell(get(row, "ID")) || `import-${i}`,
      title: textCell(get(row, "Título")),
      format,
      date: date(get(row, "Fecha"), label),
      description: textCell(get(row, "Descripción")),
      status,
      metrics,
    };
    const result = dataSchema.shape.posts.element.safeParse(candidate);
    if (!result.success)
      throw new Error(
        `${label}: revisa el título, formato, fecha, estado y métricas. Usa Carrusel, Reel o Imagen y un estado válido.`,
      );
    posts.push(result.data);
  }
  const result = dataSchema.safeParse({
    version: 1,
    baseline,
    currentFollowers: followers,
    currentFollowersDate: followersDate,
    posts,
  });
  if (!result.success)
    throw new Error(
      "Revisa que las fechas existan, los ID no estén repetidos y los seguidores actuales tengan cantidad y fecha.",
    );
  return result.data;
}

export function importPlan(
  raw: string,
  filename: string,
  current: LabData,
): LabData {
  if (raw.length > 10_000_000)
    throw new Error("El archivo debe pesar menos de 10 MB.");
  if (/\.json$/i.test(filename)) return parseBackup(raw.replace(/^\uFEFF/, ""));
  if (/\.csv$/i.test(filename)) return importCsv(raw, current);
  throw new Error(
    "Selecciona un CSV. Si usas Excel, guárdalo como CSV UTF-8. También puedes recuperar un respaldo JSON anterior.",
  );
}
