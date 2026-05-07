import test from "node:test";
import assert from "node:assert/strict";

import { createRequireAuthMiddleware } from "../../../../src/shared/infrastructure/http/middleware/createRequireAuthMiddleware.js";
import {
  ApplicationForbiddenError,
  ApplicationUnauthorizedError,
} from "../../../../src/shared/application/errors/index.js";

const createNext = () => {
  const calls = [];
  const next = (error) => calls.push(error);
  next.calls = calls;
  return next;
};

test("requireAuth attaches authenticated user to request", async () => {
  const requireAuth = createRequireAuthMiddleware({
    tokenService: {
      verify: async (token) => {
        assert.equal(token, "Bearer token");
        return { _id: "u1" };
      },
    },
    authUserRepository: {
      findById: async (id) => ({ _id: id, admin: true }),
    },
  });

  const req = { headers: { authorization: "Bearer token" } };
  const next = createNext();

  await requireAuth(req, {}, next);

  assert.deepEqual(req.user, { _id: "u1", admin: true });
  assert.deepEqual(next.calls, [undefined]);
});

test("requireAuth returns unauthorized when header is missing", async () => {
  const requireAuth = createRequireAuthMiddleware({
    tokenService: { verify: async () => ({ _id: "u1" }) },
    authUserRepository: { findById: async () => ({ _id: "u1" }) },
  });
  const next = createNext();

  await requireAuth({ headers: {} }, {}, next);

  assert.equal(next.calls[0] instanceof ApplicationUnauthorizedError, true);
  assert.equal(next.calls[0].message, "Authorization header is missing");
});

test("requireAuth returns unauthorized when user no longer exists", async () => {
  const requireAuth = createRequireAuthMiddleware({
    tokenService: { verify: async () => ({ _id: "u1" }) },
    authUserRepository: { findById: async () => null },
  });
  const next = createNext();

  await requireAuth({ headers: { authorization: "Bearer token" } }, {}, next);

  assert.equal(next.calls[0] instanceof ApplicationUnauthorizedError, true);
  assert.equal(next.calls[0].message, "Authenticated user no longer exists");
});

test("requireAdmin allows admins and rejects non-admin users", () => {
  const requireAuth = createRequireAuthMiddleware({
    tokenService: { verify: async () => ({ _id: "u1" }) },
    authUserRepository: { findById: async () => ({ _id: "u1" }) },
  });

  const adminNext = createNext();
  requireAuth.requireAdmin({ user: { _id: "u1", admin: true } }, {}, adminNext);
  assert.deepEqual(adminNext.calls, [undefined]);

  const userNext = createNext();
  requireAuth.requireAdmin({ user: { _id: "u2", admin: false } }, {}, userNext);
  assert.equal(userNext.calls[0] instanceof ApplicationForbiddenError, true);

  const anonymousNext = createNext();
  requireAuth.requireAdmin({}, {}, anonymousNext);
  assert.equal(anonymousNext.calls[0] instanceof ApplicationUnauthorizedError, true);
});
