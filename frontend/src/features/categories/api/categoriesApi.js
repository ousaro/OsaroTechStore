const E = { root: "/categories", byId: (id) => `/categories/${id}` };

export function createHttpCategoryRepository({ httpClient, sessionStore }) {
  const adapter = {
    async getAll(token) {
      return httpClient(E.root, { token });
    },
    async getById(id, token) {
      return httpClient(E.byId(id), { token });
    },
    async create(payload, token) {
      return httpClient(E.root, { method: "POST", body: payload, token });
    },
    async update(id, patch, token) {
      return httpClient(E.byId(id), { method: "PUT", body: patch, token });
    },
    async delete(id, token) {
      return httpClient(E.byId(id), { method: "DELETE", token });
    },
  };
  return adapter;
}
