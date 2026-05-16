
const E = { cart: "/users/me/cart" };

export function createHttpCartRepository({ httpClient, sessionStore }) {
  const tok = () => sessionStore.get()?.token;

  const adapter = {
    async saveCart(cartLines) {
      return httpClient(E.cart, { method: "PUT", body: { cart: cartLines }, token: tok() });
    },
  };  return adapter;
}
