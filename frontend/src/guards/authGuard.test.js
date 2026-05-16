import { requireAdmin, requireAuth } from "./authGuard.js";

test("requireAuth rejects missing users", () => {
  expect(() => requireAuth(null)).toThrow("UNAUTHENTICATED");
});

test("requireAdmin rejects non-admin users and accepts admins", () => {
  expect(() => requireAdmin({ isAdmin: false })).toThrow("FORBIDDEN");
  expect(() => requireAdmin({ isAdmin: true })).not.toThrow();
});
