/**
 * SHARED KERNEL — Auth Guards
 * Used by the router and module composition to protect routes.
 */

export function requireAuth(user) {
  if (!user) throw new Error("UNAUTHENTICATED");
}

export function requireAdmin(user) {
  requireAuth(user);
  if (!user.isAdmin) throw new Error("FORBIDDEN");
}
