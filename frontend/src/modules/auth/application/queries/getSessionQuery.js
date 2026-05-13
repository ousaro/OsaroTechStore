import { AuthUser } from "../../domain/entities/AuthUser.js";

export function createGetSessionQuery({ sessionStore }) {
  return function getSession() {
    const raw = sessionStore.get();
    return raw ? new AuthUser(raw) : null;
  };
}
