import { assertPort } from "../../../../../shared/kernel/assertions/portAssertions.js";

const E = {
  me:       "/users/me",
  byId:     (id) => `/users/${id}`,
  favorite: (productId) => `/users/me/favorites/${productId}`,
};

export function createHttpUserRepository({ httpClient, sessionStore }) {
  const tok = () => sessionStore.get()?.token;

  const adapter = {
    async getMe()            { return httpClient(E.me, { token: tok() }); },
    async updateMe(patch)    { return httpClient(E.me, { method: "PUT", body: patch, token: tok() }); },
    /** action: "add" | "remove" — per openapi.yaml */
    async toggleFavorite(productId, action) {
      return httpClient(E.favorite(productId), { method: "PUT", body: { action }, token: tok() });
    },
    async getById(id)        { return httpClient(E.byId(id), { token: tok() }); },
    async deleteById(id)     { return httpClient(E.byId(id), { method: "DELETE", token: tok() }); },
    async updateById(id, patch) {
      return httpClient(E.byId(id), { method: "PUT", body: patch, token: tok() });
    },
  };

  assertPort("UserRepositoryPort", adapter, ["getMe","updateMe","toggleFavorite","getById","deleteById","updateById"]);
  return adapter;
}
