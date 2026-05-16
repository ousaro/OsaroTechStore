export function requireAuth(user) {
  if (!user) throw new Error("UNAUTHENTICATED");
}

export function requireAdmin(user) {
  requireAuth(user);
  if (!user.isAdmin) throw new Error("FORBIDDEN");
}
