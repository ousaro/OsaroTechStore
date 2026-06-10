const E = {
  root: "/products",
  byId: (id) => `/products/${id}`,
  uploads: "/products/uploads",
  reviews: (id) => `/products/${id}/reviews`,
};

export function createHttpProductRepository({ httpClient }) {
  const adapter = {
    async getAll(params = {}, token) {
      const q = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      return httpClient(E.root + (q ? `?${q}` : ""), { token });
    },
    async getById(id, token) {
      return httpClient(E.byId(id), { token });
    },
    async create(payload, token) {
      return httpClient(E.root, { method: "POST", body: payload, token });
    },
    async uploadImage(file, token) {
      return httpClient(E.uploads, {
        method: "POST",
        body: file,
        token,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
    },
    async update(id, patch, token) {
      return httpClient(E.byId(id), { method: "PUT", body: patch, token });
    },
    async delete(id, token) {
      return httpClient(E.byId(id), { method: "DELETE", token });
    },
    async addReview(id, payload, token) {
      return httpClient(E.reviews(id), { method: "POST", body: payload, token });
    },
  };
  return adapter;
}
