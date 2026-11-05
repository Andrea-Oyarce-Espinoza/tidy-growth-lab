"use client";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { emptyPlan, parseBackup, type LabData } from "@/lib/data";
import { Planner } from "./planner";
import { GoogleSignIn } from "./google-sign-in";

export function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<LabData | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const loadedUser = useRef<string | null | undefined>(undefined);
  const supabase = getSupabase();
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    if (new URLSearchParams(window.location.hash.slice(1)).has("error")) {
      setMessage("No se pudo completar el acceso. Inténtalo otra vez.");
    }
    async function load(next: User | null) {
      if (!active) return;
      if (loadedUser.current === (next?.id ?? null)) return;
      loadedUser.current = next?.id ?? null;
      setLoading(true);
      setUser(next);
      setPlan(null);
      setRevision(null);
      try {
        if (next) {
          const { data, error } = await supabase!
            .from("plans")
            .select("data, revision")
            .eq("user_id", next.id)
            .maybeSingle();
          if (error) throw error;
          const empty = emptyPlan(new Date().toISOString().slice(0, 10));
          if (active && loadedUser.current === next.id) {
            setPlan(data ? parseBackup(JSON.stringify(data.data)) : empty);
            setRevision(data?.revision ?? null);
          }
        }
      } catch {
        if (active)
          setMessage(
            "No pudimos cargar tu plan. Recarga para reintentar; no se reemplazarán tus datos.",
          );
      } finally {
        if (active && loadedUser.current === (next?.id ?? null))
          setLoading(false);
      }
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Database work runs outside the authentication callback.
      setTimeout(() => {
        if (active) void load(session?.user ?? null);
      }, 0);
    });
    return () => {
      active = false;
      loadedUser.current = undefined;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function save(data: LabData) {
    if (!supabase || !user) throw new Error("Vuelve a iniciar sesión.");
    const valid = parseBackup(JSON.stringify(data));
    const query =
      revision === null
        ? supabase
            .from("plans")
            .insert({ user_id: user.id, data: valid, revision: 1 })
        : supabase
            .from("plans")
            .update({ data: valid, revision: revision + 1 })
            .eq("user_id", user.id)
            .eq("revision", revision);
    const result = await query.select("revision").single();
    if (result.error || !result.data)
      throw new Error(
        "No se guardó. Exporta un respaldo y recarga: puede haber cambios en otra pestaña o un problema de conexión.",
      );
    setRevision(result.data.revision);
  }

  if (loading)
    return (
      <main className="access-card" role="status">
        Abriendo tu espacio…
      </main>
    );
  if (user && plan)
    return (
      <Planner
        key={user.id}
        account={{
          email: user.email ?? "Mi cuenta",
          data: plan,
          save,
          signOut: async () => {
            const { error } = await supabase!.auth.signOut();
            if (error) throw error;
            window.location.assign("/");
          },
        }}
      />
    );
  if (user)
    return (
      <main className="access-card">
        <p role="alert">{message}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </main>
    );
  return (
    <main className="access-card">
      <a href="/" className="eyebrow">
        ← TIDY GROWTH LAB
      </a>
      <h1>
        {mode === "signup"
          ? "Tu crecimiento empieza aquí."
          : "Qué bueno tenerte de vuelta."}
      </h1>
      <p>Un espacio gratuito para tus ideas, publicaciones y métricas.</p>
      {supabase && <GoogleSignIn />}
      {!supabase ? (
        <p role="status">
          Estamos preparando la apertura. El registro estará disponible pronto.
        </p>
      ) : (
        <form
          method="post"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setMessage("");
            const form = new FormData(event.currentTarget);
            const email = String(form.get("email")).trim();
            const password = String(form.get("password"));
            try {
              const result =
                mode === "signup"
                  ? await supabase.auth.signUp({
                      email,
                      password,
                      options: {
                        emailRedirectTo: `${window.location.origin}/mi-lab`,
                      },
                    })
                  : await supabase.auth.signInWithPassword({ email, password });
              if (result.error) throw result.error;
              setMessage(
                mode === "signup"
                  ? "Revisa tu correo para confirmar tu cuenta. Si ya tienes una, inicia sesión."
                  : "Sesión iniciada.",
              );
            } catch {
              setMessage(
                "No se pudo completar. Revisa tus datos o inténtalo más tarde.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Correo electrónico
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              required
              minLength={12}
              maxLength={128}
            />
          </label>
          {mode === "signup" && (
            <label className="consent">
              <input type="checkbox" required /> Entiendo que mi correo y mi
              plan se guardan para darme acceso a la herramienta. No me suscribo
              a correos promocionales.
            </label>
          )}
          <button className="public-button" disabled={busy}>
            {busy
              ? "Un momento…"
              : mode === "signup"
                ? "Crear mi cuenta gratis →"
                : "Ingresar a mi lab →"}
          </button>
        </form>
      )}
      <p role="status">{message}</p>
      {supabase && (
        <p>
          <a className="text-button" href="/recuperar">
            Olvidé mi contraseña
          </a>
        </p>
      )}
      {supabase && (
        <button
          className="text-button"
          onClick={() => {
            setMode(mode === "signup" ? "login" : "signup");
            setMessage("");
          }}
        >
          {mode === "signup"
            ? "Ya tengo cuenta · Iniciar sesión"
            : "Crear una cuenta gratuita"}
        </button>
      )}
      <small>
        No necesitas compartir la contraseña de tus redes sociales. Las métricas
        se ingresan manualmente.{" "}
        <a href="/privacidad">Privacidad y tus datos</a>.
      </small>
    </main>
  );
}
