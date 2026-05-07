import test from "node:test";
import assert from "node:assert/strict";

import { createJwtTokenService } from "../../../../../src/modules/auth/adapters/output/services/jwtTokenService.js";
import { AuthUnauthorizedError } from "../../../../../src/modules/auth/application/errors/AuthApplicationError.js";

test("jwt token service signs and verifies user ids", () => {
  const service = createJwtTokenService({ secret: "test-secret", expiresIn: "1h" });
  const token = service.signUserId("u1");

  assert.equal(service.verify(`Bearer ${token}`)._id, "u1");
  assert.equal(service.extractUserId(token), "u1");
});

test("jwt token service rejects missing, malformed, and invalid tokens", () => {
  const service = createJwtTokenService({ secret: "test-secret", expiresIn: "1h" });

  assert.throws(() => service.verify(), AuthUnauthorizedError);
  assert.throws(() => service.verify("Token abc"), AuthUnauthorizedError);
  assert.throws(() => service.verify("Bearer invalid"), AuthUnauthorizedError);
  assert.throws(() => service.extractUserId("invalid"), AuthUnauthorizedError);
});

test("jwt token service requires a secret", () => {
  assert.throws(() => createJwtTokenService({ secret: "" }));
});
