import type { AuthChangeEvent } from "@supabase/supabase-js";

// A normal login must never authorize the password-recovery form.
export function recoveryIdentity(
  event: AuthChangeEvent,
  sessionUserId: string | null,
  recoveryUserId: string | null,
): string | null {
  if (event === "PASSWORD_RECOVERY") return sessionUserId;
  if (!sessionUserId || sessionUserId !== recoveryUserId) return null;
  return recoveryUserId;
}
