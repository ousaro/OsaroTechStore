import { createCartModule } from "./cartService.js";

const createDeps = () => {
  const events = [];
  const session = { token: "token-1", cart: [] };

  return {
    deps: {
      cart: {
        saveCart: jest.fn(async (cart) => ({ ok: true, data: cart })),
      },
      sessionStore: {
        get: jest.fn(() => session),
        patch: jest.fn((partial) => Object.assign(session, partial)),
      },
      eventBus: {
        publish: jest.fn((event) => events.push(event)),
      },
      notify: {
        error: jest.fn(),
      },
    },
    events,
    session,
  };
};

test("cart module adds items, persists the cart, and publishes updates", async () => {
  const { deps, session } = createDeps();
  const cartModule = createCartModule(deps);

  const cart = await cartModule.addToCart("product-1", 2);

  expect(cart.count).toBe(2);
  expect(deps.cart.saveCart).toHaveBeenCalledWith([{ productId: "product-1", quantity: 2 }]);
  expect(session.cart).toEqual([{ productId: "product-1", quantity: 2 }]);
  expect(deps.eventBus.publish).toHaveBeenCalledTimes(1);
});

test("cart module clears checkout state through the same sync flow", async () => {
  const { deps } = createDeps();
  const cartModule = createCartModule(deps);

  await cartModule.addToCart("product-1", 2);
  const cart = await cartModule.clearCart();

  expect(cart.isEmpty).toBe(true);
  expect(deps.cart.saveCart).toHaveBeenLastCalledWith([]);
});
