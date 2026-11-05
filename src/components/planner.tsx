"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  FlaskConical,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
  Target,
  Users,
  Video,
  Layers,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PostEditor } from "@/components/post-editor";
import {
  dateAt,
  emptyMetrics,
  initialData,
  parseBackup,
  START,
  statuses,
  STORAGE_KEY,
  type LabData,
  type Post,
} from "@/lib/data";
const dateLabel = (v: string) =>
  new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(v + "T12:00:00Z"));
const statusClass = (v: string) =>
  v === "publicado"
    ? "mint"
    : v === "programado"
      ? "purple"
      : v === "en producción"
        ? "pink"
        : "neutral";
const iconFor = (format: string) =>
  format === "Reel" ? (
    <Video size={13} />
  ) : format === "Carrusel" ? (
    <Layers size={13} />
  ) : (
    <ImageIcon size={13} />
  );
type Account = {
  email: string;
  data: LabData;
  save: (data: LabData) => Promise<void>;
  signOut: () => Promise<void>;
};
export function Planner({ account }: { account?: Account }) {
  const [data, setData] = useState<LabData>(
    () => account?.data ?? initialData(),
  );
  const [saving, setSaving] = useState(false);
  const [savedData, setSavedData] = useState(() =>
    JSON.stringify(account?.data ?? initialData()),
  );
  const dirty = !!account && JSON.stringify(data) !== savedData;
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [month, setMonth] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todos");
  const [editing, setEditing] = useState<Post | null>(null);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followers, setFollowers] = useState("");
  const [followersDate, setFollowersDate] = useState(START);
  const [pending, setPending] = useState<LabData | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (account) {
      setReady(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(parseBackup(raw));
    } catch {
      setBlocked(true);
      setNotice(
        "No pudimos leer los datos locales. No se sobrescribirán. Puedes exportar la copia original o importar un respaldo válido.",
      );
    }
    setReady(true);
  }, [account]);
  useEffect(() => {
    if (!ready || blocked || account) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      setNotice(
        "No se pudo guardar en este navegador. Exporta un respaldo antes de cerrar.",
      );
    }
  }, [data, ready, blocked, account]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function download(raw: string, name: string) {
    const url = URL.createObjectURL(
      new Blob([raw], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const filtered = data.posts
    .filter(
      (p) =>
        (status === "todos" || p.status === status) &&
        `${p.title} ${p.description}`
          .toLocaleLowerCase("es")
          .includes(query.toLocaleLowerCase("es")),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const published = data.posts.filter((p) => p.status === "publicado").length;
  const planned = data.posts.filter((p) => p.status === "programado").length;
  const start = account ? data.baseline.date : START;
  const base = new Date(start + "T12:00:00Z");
  const monthDate = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + month, 1),
  );
  const year = monthDate.getUTCFullYear();
  const monthNumber = monthDate.getUTCMonth();
  const firstOffset = (monthDate.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, monthNumber + 1, 0)).getUTCDate();
  function create(date = start) {
    setEditing({
      id: crypto.randomUUID(),
      title: "",
      format: "Carrusel",
      date,
      description: "",
      status: "idea",
      metrics: emptyMetrics(),
    });
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#main" className="brand">
          <span className="brand-icon">
            <FlaskConical size={22} />
          </span>
          <span>
            tidy<span className="brand-dot">.</span>
            <small>GROWTH LAB</small>
          </span>
        </a>
        <div className="workspace-label">TU ESPACIO DE CRECIMIENTO</div>
        <a href="#main" className="nav-item active">
          <CalendarDays size={18} />
          Planificador<span>{data.posts.length}</span>
        </a>
        <div className="sidebar-note">
          <Sparkles size={21} />
          <h3>
            Pequeños pasos.
            <br />
            Crecimiento real.
          </h3>
          <p>
            2 publicaciones por semana.
            <br />
            Una intención en cada una.
          </p>
          <span>HECHO PARA TIDY STUDIO ↗</span>
        </div>
        <div className="profile">
          <span>ts</span>
          <div>
            {account?.email ?? "Tidy Studio"}
            <small>
              {account ? "Mi espacio personal" : "Creative web studio"}
            </small>
          </div>
          <Circle size={8} fill="#43a99a" stroke="none" />
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            Workspace <span className="mx-3 text-slate-300">/</span>
            <strong>{account ? "Mi lab" : "Tidy Studio"}</strong>
          </span>
          <span className="local-badge">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            {ready
              ? account
                ? dirty
                  ? "Cambios sin guardar"
                  : "Plan guardado"
                : "Almacenamiento local"
              : "Cargando…"}
          </span>
          {account && (
            <div className="account-actions">
              <Button
                disabled={!dirty || saving}
                onClick={async () => {
                  setSaving(true);
                  const snapshot = JSON.stringify(data);
                  try {
                    await account.save(data);
                    setSavedData(snapshot);
                    setNotice("Tu plan se guardó en tu cuenta.");
                  } catch (error) {
                    setNotice(
                      error instanceof Error
                        ? error.message
                        : "No se pudo guardar. Exporta un respaldo.",
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Guardando…" : "Guardar mi plan"}
              </Button>
              <Button
                variant="ghost"
                disabled={saving}
                onClick={async () => {
                  if (
                    dirty &&
                    !window.confirm(
                      "Tienes cambios sin guardar. ¿Cerrar sesión de todas formas?",
                    )
                  )
                    return;
                  try {
                    await account.signOut();
                  } catch {
                    setNotice("No se pudo cerrar sesión. Inténtalo otra vez.");
                  }
                }}
              >
                Salir
              </Button>
            </div>
          )}
        </header>
        <main id="main" className="main" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span /> MENOS IMPROVISACIÓN, MÁS INTENCIÓN
              </div>
              <h1>
                Tu próximo capítulo
                <br className="sm:hidden" /> de crecimiento<span>.</span>
              </h1>
              <p>Ideas que conectan. Contenido que abre conversaciones.</p>
            </div>
            <Button disabled={!ready || blocked} onClick={() => create()}>
              <Plus size={17} />
              Nueva publicación
            </Button>
          </div>
          <section className="stats" aria-label="Resumen de crecimiento">
            <article className="stat">
              <div className="stat-top">
                Punto de partida
                <Users size={17} />
              </div>
              <strong>
                {data.baseline.count ?? "—"}
                <span>seguidores</span>
              </strong>
              <small>
                {data.baseline.count === null
                  ? "Registra tus seguidores actuales"
                  : `Dato registrado · ${dateLabel(data.baseline.date)}`}
              </small>
            </article>
            <article className="stat">
              <div className="stat-top">
                Seguidores actuales
                <ArrowUpRight size={18} />
              </div>
              <button
                disabled={!ready || blocked}
                className="followers-button"
                onClick={() => {
                  setFollowers(data.currentFollowers?.toString() ?? "");
                  setFollowersDate(data.currentFollowersDate ?? start);
                  setFollowersOpen(true);
                }}
              >
                {data.currentFollowers === null ? (
                  <strong className="no-data">
                    Sin registrar <Plus size={17} />
                  </strong>
                ) : (
                  <strong>
                    {data.currentFollowers.toLocaleString("es-CL")}
                    <span>seguidores</span>
                  </strong>
                )}
              </button>
              <small>
                {data.currentFollowersDate
                  ? `Registro manual · ${dateLabel(data.currentFollowersDate)}`
                  : "Agrega tu primer registro manual"}
              </small>
            </article>
            <article className="stat">
              <div className="stat-top">
                Contenido publicado
                <Check size={17} />
              </div>
              <strong>
                {published}
                <span>/ {data.posts.length} ideas</span>
              </strong>
              <small>{planned} programadas · A tu propio ritmo</small>
            </article>
            <article className="stat goal">
              <div className="stat-top">
                La dirección, sin prisa
                <Target size={18} />
              </div>
              <strong>
                {account ? "A tu ritmo" : "60.000"}
                <span>
                  {account ? "con tus datos reales" : "seguidores reales"}
                </span>
              </strong>
              {!account && (
                <div className="goal-track">
                  <div
                    style={{
                      width: `${Math.min(100, ((data.currentFollowers ?? data.baseline.count ?? 0) / 60000) * 100)}%`,
                    }}
                  />
                </div>
              )}
              <small>
                {account
                  ? "Planifica, observa y ajusta tu contenido"
                  : "Meta a largo plazo · Sin fecha límite"}
              </small>
            </article>
          </section>
          <section className="rhythm">
            <span className="rhythm-icon">
              <Sparkles size={20} />
            </span>
            <div>
              <strong>La constancia también puede ser liviana.</strong>
              <p>
                Tu plan: 2 publicaciones semanales, en 2–3 horas. Comienza con
                una idea y hazla tuya.
              </p>
            </div>
            <span className="rhythm-tag">
              {account ? "TU PLAN · A TU RITMO" : "13 SEMANAS · 26 IDEAS"}
            </span>
          </section>
          <section className="planner-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Planificador editorial <span>90 días</span>
                </h2>
                <p>
                  {dateLabel(start)} — {dateLabel(dateAt(89, start))} · Fechas
                  propuestas, tú decides.
                </p>
              </div>
              <div className="backup-buttons">
                <Button
                  variant="ghost"
                  onClick={() => {
                    try {
                      download(
                        blocked
                          ? (localStorage.getItem(STORAGE_KEY) ??
                              JSON.stringify(data))
                          : JSON.stringify(data, null, 2),
                        "tidy-growth-lab-backup.json",
                      );
                    } catch {
                      setNotice("No se pudo exportar el archivo.");
                    }
                  }}
                  disabled={!ready}
                >
                  <ArrowDownToLine size={15} />
                  Exportar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => importRef.current?.click()}
                  disabled={!ready}
                >
                  <ArrowUpFromLine size={15} />
                  Importar
                </Button>
                <input
                  ref={importRef}
                  aria-label="Importar respaldo JSON"
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (file.size > 10_000_000) {
                      setNotice("El respaldo debe pesar menos de 10 MB.");
                      return;
                    }
                    try {
                      setPending(parseBackup(await file.text()));
                    } catch {
                      setNotice(
                        "Respaldo inválido: revisa su versión, fechas y métricas. Tus datos se mantienen.",
                      );
                    }
                  }}
                />
              </div>
            </div>
            {notice && (
              <div role="status" className="notice">
                {notice}
                <button aria-label="Cerrar aviso" onClick={() => setNotice("")}>
                  ×
                </button>
              </div>
            )}
            <div className="toolbar">
              <div className="month-nav">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={month === 0}
                  aria-label="Mes anterior"
                  onClick={() => setMonth((v) => v - 1)}
                >
                  <ChevronLeft size={17} />
                </Button>
                <h3>
                  {new Intl.DateTimeFormat("es-CL", {
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(monthDate)}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={month === 3}
                  aria-label="Mes siguiente"
                  onClick={() => setMonth((v) => v + 1)}
                >
                  <ChevronRight size={17} />
                </Button>
              </div>
              <div className="toolbar-filters">
                <label className="search">
                  <Search size={15} />
                  <input
                    aria-label="Buscar publicaciones"
                    placeholder="Buscar una idea…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Filtrar por estado"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  {statuses.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <div className="view-toggle">
                  <button
                    aria-label="Vista calendario"
                    aria-pressed={view === "calendar"}
                    onClick={() => setView("calendar")}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    aria-label="Vista lista"
                    aria-pressed={view === "list"}
                    onClick={() => setView("list")}
                  >
                    <List size={17} />
                  </button>
                </div>
              </div>
            </div>
            {view === "calendar" ? (
              <>
                <div className="calendar-scroll">
                  <div className="calendar">
                    <div className="weekdays">
                      {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map(
                        (day) => (
                          <div key={day}>{day}</div>
                        ),
                      )}
                    </div>
                    <div className="calendar-grid">
                      {Array.from(
                        { length: Math.ceil((firstOffset + days) / 7) * 7 },
                        (_, i) => {
                          const day = i - firstOffset + 1;
                          const date = `${year}-${String(monthNumber + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                          const exists = day > 0 && day <= days;
                          const enabled =
                            exists &&
                            date >= start &&
                            date <= dateAt(89, start);
                          const posts = filtered.filter((p) => p.date === date);
                          return (
                            <div
                              className={`day ${enabled ? "" : "muted-day"}`}
                              key={i}
                            >
                              {exists && (
                                <>
                                  <div className="day-number">
                                    <span
                                      className={
                                        date === start ? "start-day" : ""
                                      }
                                    >
                                      {day}
                                    </span>
                                    {enabled && (
                                      <button
                                        disabled={blocked || !ready}
                                        aria-label={`Crear publicación el ${date}`}
                                        onClick={() => create(date)}
                                      >
                                        <Plus size={13} />
                                      </button>
                                    )}
                                  </div>
                                  {enabled &&
                                    posts.map((p) => (
                                      <button
                                        key={p.id}
                                        disabled={blocked || !ready}
                                        className={`post-card ${p.format === "Reel" ? "reel" : p.format === "Imagen" ? "image" : "carousel"}`}
                                        onClick={() => setEditing(p)}
                                      >
                                        <span className="post-format">
                                          {iconFor(p.format)}
                                          {p.format}
                                        </span>
                                        <strong>{p.title}</strong>
                                        <span
                                          className={`status-dot ${statusClass(p.status)}`}
                                        >
                                          {p.status}
                                        </span>
                                      </button>
                                    ))}
                                </>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
                <div className="calendar-footer">
                  <div>
                    {statuses.map((s) => (
                      <span key={s}>
                        <i className={statusClass(s)} />
                        {s}
                      </span>
                    ))}
                  </div>
                  <span>Un espacio para crecer con intención ↗</span>
                </div>
                {filtered.some(
                  (p) => p.date < start || p.date > dateAt(89, start),
                ) && (
                  <p className="px-5 pb-4 text-sm text-slate-500">
                    Hay publicaciones fuera de los 90 días. Puedes verlas y
                    editarlas en la vista de lista.
                  </p>
                )}
              </>
            ) : (
              <div className="post-list">
                {filtered.length === 0 ? (
                  <p className="p-8 text-center text-slate-500">
                    No hay publicaciones con estos filtros.
                  </p>
                ) : (
                  filtered.map((p) => (
                    <button
                      disabled={blocked || !ready}
                      key={p.id}
                      onClick={() => setEditing(p)}
                      className="list-row"
                    >
                      <span className="list-date">
                        {dateLabel(p.date)}
                        <small>{p.date.slice(0, 4)}</small>
                      </span>
                      <span className="list-title">
                        <small>{p.format}</small>
                        <strong>{p.title}</strong>
                      </span>
                      <span className={`status-dot ${statusClass(p.status)}`}>
                        {p.status}
                      </span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))
                )}
              </div>
            )}
          </section>
          <footer className="page-footer">
            <span>
              <FlaskConical size={14} /> Tidy Growth Lab{" "}
              <span className="opacity-50">/</span> Construido para avanzar.
            </span>
            <span>
              {account
                ? "Usa Guardar mi plan antes de salir · Exporta respaldos"
                : "Datos en este navegador · Haz respaldos periódicos"}
            </span>
          </footer>
        </main>
      </div>
      {editing && (
        <PostEditor
          key={editing.id}
          post={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            setData((d) => ({
              ...d,
              posts: d.posts.some((v) => v.id === p.id)
                ? d.posts.map((v) => (v.id === p.id ? p : v))
                : [...d.posts, p],
            }));
            setEditing(null);
          }}
        />
      )}
      {followersOpen && (
        <Dialog
          open
          onOpenChange={setFollowersOpen}
          title="Registrar seguidores actuales"
          description="Ingresa el número real de seguidores de tu cuenta y la fecha de observación."
        >
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              const count = Number(followers);
              if (
                !followers.trim() ||
                !Number.isSafeInteger(count) ||
                count < 0
              )
                return;
              try {
                const next = parseBackup(
                  JSON.stringify({
                    ...data,
                    baseline:
                      data.baseline.count === null
                        ? { count, date: followersDate }
                        : data.baseline,
                    currentFollowers: count,
                    currentFollowersDate: followersDate,
                  }),
                );
                setData(next);
                setFollowersOpen(false);
              } catch {
                setNotice("Revisa la fecha y la cantidad de seguidores.");
              }
            }}
          >
            <label className="field">
              Seguidores
              <input
                required
                type="number"
                min={0}
                step={1}
                max={Number.MAX_SAFE_INTEGER}
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
              />
            </label>
            <label className="field">
              Fecha de observación
              <input
                required
                type="date"
                value={followersDate}
                onChange={(e) => setFollowersDate(e.target.value)}
              />
            </label>
            <Button>Guardar registro</Button>
          </form>
        </Dialog>
      )}
      {pending && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setPending(null);
          }}
          title="Restaurar respaldo"
          description={`Este respaldo contiene ${pending.posts.length} publicaciones. Reemplazará tu plan abierto${account ? "; usa Guardar mi plan para confirmar en tu cuenta" : " en este navegador"}.`}
        >
          <p className="mb-5 text-sm text-slate-600">
            Exporta primero si quieres conservar una copia de tu planificación
            actual.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                try {
                  if (!account)
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
                  setData(pending);
                  setBlocked(false);
                  setPending(null);
                  setNotice(
                    account
                      ? "Respaldo restaurado. Usa Guardar mi plan para guardarlo en tu cuenta."
                      : "Respaldo restaurado y guardado.",
                  );
                } catch {
                  setNotice(
                    "No hay espacio o acceso al almacenamiento. No se reemplazaron tus datos.",
                  );
                  setPending(null);
                }
              }}
            >
              Reemplazar y restaurar
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
