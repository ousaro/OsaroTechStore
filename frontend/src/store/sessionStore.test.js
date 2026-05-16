import { sessionStore } from "./sessionStore.js";

beforeEach(() => {
  sessionStorage.clear();
});

test("sessionStore keeps auth session data in tab-scoped storage", () => {
  sessionStore.set({ token: "token-1", user: { id: "user-1" }, cart: [] });

  expect(sessionStore.get()).toEqual({ token: "token-1", user: { id: "user-1" }, cart: [] });

  sessionStore.patch({ cart: [{ productId: "product-1", quantity: 2 }] });

  expect(sessionStore.get()).toEqual({
    token: "token-1",
    user: { id: "user-1" },
    cart: [{ productId: "product-1", quantity: 2 }],
  });

  sessionStore.clear();

  expect(sessionStore.get()).toBeNull();
});
