/**
 * AUTH — Output Adapter: HTTP Auth Repository
 * Implements AuthRepositoryPort against the real API.
 */
import { assertPort } from "../../../../../shared/kernel/assertions/portAssertions.js";
import { AUTH_REPOSITORY_PORT_METHODS } from "../../../ports/output/AuthRepositoryPort.js";

const E = {
  login:    "/auth/login",
  register: "/auth/register",
  users:    "/auth/users",
  user:     (id) => `/auth/users/${id}`,
};

export function createHttpAuthRepository({ httpClient, sessionStore }) {
  const tok = () => sessionStore.get()?.token;

  const adapter = {
    async login(email, password) {
      return httpClient(E.login, { method: "POST", body: { email, password } });
    },
    async register(payload) {
      return httpClient(E.register, { method: "POST", body: payload });
    },
    async listUsers() {
      return httpClient(E.users, { token: tok() });
    },
    async deleteUser(id) {
      return httpClient(E.user(id), { method: "DELETE", token: tok() });
    },
    async updateUser(id, patch) {
      return httpClient(E.user(id), { method: "PUT", body: patch, token: tok() });
    },
  };

  assertPort("AuthRepositoryPort", adapter, AUTH_REPOSITORY_PORT_METHODS);
  return adapter;
}
