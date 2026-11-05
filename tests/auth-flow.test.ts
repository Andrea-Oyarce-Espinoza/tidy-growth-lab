import { test } from "node:test";
import assert from "node:assert/strict";
import { recoveryIdentity } from "../src/lib/auth-flow";

test("una sesión normal no habilita el cambio desde un enlace vencido", () => {
  assert.equal(recoveryIdentity("INITIAL_SESSION", "account-a", null), null);
  assert.equal(recoveryIdentity("SIGNED_IN", "account-a", null), null);
  assert.equal(recoveryIdentity("TOKEN_REFRESHED", "account-a", null), null);
});
test("la recuperación solo sigue autorizada para la identidad del enlace", () => {
  const identity = recoveryIdentity("PASSWORD_RECOVERY", "account-a", null);
  assert.equal(identity, "account-a");
  assert.equal(
    recoveryIdentity("TOKEN_REFRESHED", "account-a", identity),
    identity,
  );
  assert.equal(
    recoveryIdentity("USER_UPDATED", "account-a", identity),
    identity,
  );
  assert.equal(recoveryIdentity("SIGNED_IN", "account-b", identity), null);
  assert.equal(recoveryIdentity("SIGNED_OUT", null, identity), null);
  assert.equal(recoveryIdentity("PASSWORD_RECOVERY", null, null), null);
});
