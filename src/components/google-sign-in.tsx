"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

export function GoogleSignIn() {
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function check() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
            },
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(8000),
            ]),
          },
        );
        if (!response.ok) throw new Error();
        const settings = await response.json();
        if (!controller.signal.aborted)
          setAvailable(settings.external?.google === true);
      } catch {
        /* Email access stays available when the provider cannot be checked. */
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    }
    void check();
    return () => controller.abort();
  }, []);
  return (
    <div className="google-access">
      <button
        type="button"
        className="google-button"
        disabled={checking || !available || busy}
        onClick={async () => {
          const supabase = getSupabase();
          if (!supabase) return;
          setBusy(true);
          setMessage("");
          try {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/mi-lab`,
                scopes: "openid email profile",
                queryParams: { prompt: "select_account" },
              },
            });
            if (error) throw error;
          } catch {
            setMessage(
              "No pudimos abrir Google. Inténtalo otra vez o ingresa con tu correo.",
            );
            setBusy(false);
          }
        }}
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.97-3.38.97-2.6 0-4.82-1.76-5.61-4.12H3.05v2.59A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.39 13.93A6 6 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.48H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.52l3.34-2.59Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.95c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.48l3.34 2.59C7.18 7.71 9.4 5.95 12 5.95Z"
          />
        </svg>
        {busy ? "Abriendo Google…" : "Continuar con Google"}
      </button>
      {!checking && !available && (
        <small>El acceso con Google estará disponible pronto.</small>
      )}
      {message && <p role="alert">{message}</p>}
      <div className="auth-divider">o usa tu correo</div>
    </div>
  );
}
