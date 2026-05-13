import { assertPort } from "../../../../../shared/kernel/assertions/portAssertions.js";

const E = {
  root:  "/products",
  byId:  (id) => `/products/${id}`,
};

export function createHttpProductRepository({ httpClient }) {
  const adapter = {
    async getAll(params = {}, token) {
      const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v))).toString();
      return httpClient(E.root + (q ? `?${q}` : ""), { token });
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

  assertPort("ProductRepositoryPort", adapter, ["getAll","getById","create","update","delete"]);
  return adapter;
}
