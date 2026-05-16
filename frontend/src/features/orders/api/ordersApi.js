const E = { root: "/orders", byId: (id) => `/orders/${id}` };

export function createHttpOrderRepository({ httpClient }) {
  const adapter = {
    async getAll(params = {}, token) {
      const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v))).toString();
      return httpClient(E.root + (q ? `?${q}` : ""), { token });
    },
    async getById(id, token)          { return httpClient(E.byId(id), { token }); },
    async create(payload, token)      { return httpClient(E.root, { method: "POST", body: payload, token }); },
    // patch uses orderStatus field (not status) — per openapi.yaml
    async update(id, patch, token)    { return httpClient(E.byId(id), { method: "PUT", body: patch, token }); },
    async delete(id, token)           { return httpClient(E.byId(id), { method: "DELETE", token }); },
  };  return adapter;
}
