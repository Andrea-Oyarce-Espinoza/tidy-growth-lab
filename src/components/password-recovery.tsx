"use client";
import { useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { recoveryIdentity } from "@/lib/auth-flow";

export function PasswordRecovery() {
  const supabase = getSupabase();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const recoveryUserId = useRef<string | null>(null);
  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.has("error"))
      setMessage("Este enlace ya no es válido. Solicita uno nuevo.");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      recoveryUserId.current = recoveryIdentity(
        event,
        session?.user.id ?? null,
        recoveryUserId.current,
      );
      setAuthenticated(recoveryUserId.current !== null);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <main className="access-card">
      <a href="/acceso" className="eyebrow">
        ← VOLVER AL ACCESO
      </a>
      <h1>
        {done
          ? "Tu contraseña está lista."
          : authenticated
            ? "Elige tu nueva contraseña."
            : "Recupera tu acceso."}
      </h1>
      {!ready ? (
        <p role="status">Comprobando el enlace…</p>
      ) : !supabase ? (
        <p>La recuperación estará disponible cuando se abra el registro.</p>
      ) : done ? (
        <>
          <p>Ya puedes volver a tu plan con tu nueva contraseña.</p>
          <a className="public-button" href="/mi-lab">
            Ir a mi lab →
          </a>
        </>
      ) : (
        <>
          <p>
            {authenticated
              ? "Usa al menos 12 caracteres. Tu plan y tus publicaciones se conservan."
              : "Escribe el correo de tu cuenta y te enviaremos un enlace para elegir otra contraseña."}
          </p>
          <form
            method="post"
            onSubmit={async (event) => {
              event.preventDefault();
              setMessage("");
              const form = new FormData(event.currentTarget);
              if (
                authenticated &&
                form.get("password") !== form.get("confirmation")
              ) {
                setMessage("Las contraseñas no coinciden.");
                return;
              }
              setBusy(true);
              try {
                if (authenticated) {
                  const { data, error: identityError } =
                    await supabase.auth.getUser();
                  if (
                    identityError ||
                    !data.user ||
                    data.user.id !== recoveryUserId.current
                  ) {
                    setAuthenticated(false);
                    throw new Error();
                  }
                  const { error } = await supabase.auth.updateUser({
                    password: String(form.get("password")),
                  });
                  if (error) throw error;
                  setDone(true);
                } else {
                  const { error } = await supabase.auth.resetPasswordForEmail(
                    String(form.get("email")).trim(),
                    { redirectTo: `${window.location.origin}/recuperar` },
                  );
                  if (error) throw error;
                  setMessage(
                    "Si existe una cuenta con ese correo, recibirás un enlace. Revisa también la carpeta de spam. Si usas Google, puedes volver e ingresar con Google.",
                  );
                }
              } catch {
                setMessage(
                  authenticated
                    ? "No pudimos actualizar la contraseña. Prueba una diferente o solicita un enlace nuevo."
                    : "No pudimos enviar el enlace. Inténtalo más tarde o ingresa con Google si lo usaste para crear tu cuenta.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {authenticated ? (
              <>
                <label>
                  Nueva contraseña
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </label>
                <label>
                  Repite la nueva contraseña
                  <input
                    type="password"
                    name="confirmation"
                    required
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </label>
              </>
            ) : (
              <label>
                Correo electrónico
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                />
              </label>
            )}
            <button className="public-button" disabled={busy}>
              {busy
                ? "Un momento…"
                : authenticated
                  ? "Guardar nueva contraseña"
                  : "Enviar enlace de recuperación"}
            </button>
          </form>
        </>
      )}
      <p role="status">{message}</p>
      <small>
        Si ingresaste con Google, recupera el acceso desde tu cuenta de Google.
        Nunca te pediremos tu contraseña de Google.
      </small>
    </main>
  );
}
