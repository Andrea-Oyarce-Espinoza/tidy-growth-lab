import { test } from "node:test";
import assert from "node:assert/strict";
import { exportCsv, importCsv, importPlan } from "../src/lib/csv";
import { emptyPlan, initialData } from "../src/lib/data";

test("CSV conserva todo el plan, tildes, comillas, saltos, cero y seguidores", () => {
  const data = initialData();
  data.posts[0].title = 'Mi "publicación"; útil, con ñ';
  data.posts[0].description =
    "Primera línea\nSegunda línea; y una coma, también";
  data.posts[0].metrics.alcance = 0;
  data.currentFollowers = 777;
  data.currentFollowersDate = "2026-11-05";
  const csv = exportCsv(data);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /"Título"/);
  assert.deepEqual(importCsv(csv, emptyPlan("2026-11-06")), data);
});
test("un plan vacío se descarga e importa sin inventar datos", () => {
  const data = emptyPlan("2026-11-05");
  assert.deepEqual(importCsv(exportCsv(data), initialData()), data);
});
test("CSV de Excel y Sheets acepta coma, punto y coma, tab, BOM y sep=", () => {
  for (const separator of [",", ";", "\t"]) {
    const rows = [
      [
        "Titulo",
        "Formato",
        "Fecha",
        "Descripción",
        "Estado",
        "Me gusta",
        "Alcance",
      ],
      [
        '"Una idea, útil"',
        "reel",
        "5/11/2026",
        "Hola",
        "En producción",
        "0",
        "",
      ],
    ];
    const raw = rows.map((row) => row.join(separator)).join("\r\n");
    const data = importCsv(
      `\uFEFFsep=${separator}\r\n${raw}\r\n\r\n`,
      initialData(),
    );
    assert.equal(data.posts.length, 1);
    assert.equal(data.posts[0].title, "Una idea, útil");
    assert.equal(data.posts[0].date, "2026-11-05");
    assert.equal(data.posts[0].format, "Reel");
    assert.equal(data.posts[0].metrics.meGusta, 0);
    assert.equal(data.posts[0].metrics.alcance, null);
    assert.deepEqual(data.baseline, initialData().baseline);
  }
});
test("textos con apariencia de fórmula se exportan como texto y se recuperan intactos", () => {
  const values = [
    "=1+1",
    "+SUM(A1)",
    "-1+2",
    "@SUM(A1)",
    "\t=1+1",
    "  =1+1",
    "＝1+1",
    "'texto",
    "''texto",
    "'=literal",
  ];
  for (const value of values) {
    const data = initialData();
    data.posts[0].description = value;
    const csv = exportCsv(data);
    assert.ok(csv.includes(`"'${value.replaceAll('"', '""')}"`));
    assert.equal(importCsv(csv, data).posts[0].description, value);
  }
});
test("rechaza planillas ambiguas o inválidas sin modificar el plan existente", () => {
  const current = initialData();
  const before = JSON.stringify(current);
  const invalid = [
    "Titulo;Formato;Fecha\nIdea;Reel;2026-02-30",
    "Titulo;Formato;Fecha\nIdea;Reel;11/05/26",
    "Titulo;Formato;Fecha;Alcance\nIdea;Reel;2026-11-05;-1",
    "Titulo;Formato;Fecha;Alcance\nIdea;Reel;2026-11-05;1.000",
    "Titulo;Formato;Fecha;Alcance\nIdea;Reel;2026-11-05;=1+1",
    "Titulo;Formato;Fecha;Estado\nIdea;Reel;2026-11-05;inexistente",
    "Titulo;Formato;Fecha\nIdea;TikTok;2026-11-05",
    "Titulo;Formato;Fecha\nIdea;Reel;2026-11-05;Extra",
    'Titulo;Formato;Fecha\n"Idea;Reel;2026-11-05',
    'Titulo;Formato;Fecha\n"Idea"extra;Reel;2026-11-05',
    "Titulo;Título;Formato;Fecha\nIdea;Idea;Reel;2026-11-05",
    "Titulo;Formato;Fecha;Otra\nIdea;Reel;2026-11-05;perdería datos",
    "Titulo;Formato\nIdea;Reel",
    "ID;Titulo;Formato;Fecha\nigual;Idea;Reel;2026-11-05\nigual;Otra;Reel;2026-11-06",
  ];
  for (const raw of invalid) {
    assert.throws(() => importCsv(raw, current), raw);
    assert.equal(JSON.stringify(current), before);
  }
});
test("valida la fila Cuenta y el límite de publicaciones", () => {
  const data = initialData();
  const csv = exportCsv(data);
  const lines = csv.split("\r\n");
  assert.throws(() =>
    importCsv([lines[0], lines[1], lines[1]].join("\r\n"), data),
  );
  assert.throws(() => importCsv(csv.replace('"532"', '"-1"'), data));
  const paired = exportCsv({
    ...data,
    currentFollowers: 999,
    currentFollowersDate: "2026-11-06",
  });
  assert.throws(() => importCsv(paired.replace('"2026-11-06"', '""'), data));
  const tooMany =
    "Titulo;Formato;Fecha\n" + "Idea;Reel;2026-11-05\n".repeat(5001);
  assert.throws(() => importCsv(tooMany, data));
});
test("mantiene los respaldos JSON anteriores y exige convertir archivos Excel a CSV", () => {
  const data = initialData();
  assert.deepEqual(
    importPlan(JSON.stringify(data), "anterior.JSON", data),
    data,
  );
  assert.deepEqual(importPlan(exportCsv(data), "mi-plan.CSV", data), data);
  assert.throws(() => importPlan("datos", "mi-plan.xlsm", data), /CSV UTF-8/);
  assert.throws(
    () => importPlan(" ".repeat(10_000_001), "grande.csv", data),
    /10 MB/,
  );
});
