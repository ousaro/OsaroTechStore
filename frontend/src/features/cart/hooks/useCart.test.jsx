import { render, screen } from "@testing-library/react";
import { createCartViewAdapter, useCart } from "./useCart.js";
import { Events } from "../../../lib/events.js";

jest.mock("../../auth/hooks/useAuth.js", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));

const createDeps = () => {
  const eventBus = { subscribe: jest.fn(), unsubscribe: jest.fn() };
  const cartInputPort = { addToCart: jest.fn(), removeFromCart: jest.fn(), setQuantity: jest.fn(), clearCart: jest.fn() };
  return { cartInputPort, eventBus };
};

function TestChild() {
  const ctx = useCart();
  return <div data-testid="ctx">{ctx.cart.isEmpty ? "empty" : `items:${ctx.cart.count}`}</div>;
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test("CartProvider provides context with empty cart", () => {
  const { cartInputPort, eventBus } = createDeps();
  const { CartProvider } = createCartViewAdapter({ cartInputPort, eventBus });
  render(<CartProvider><TestChild /></CartProvider>);
  expect(screen.getByTestId("ctx").textContent).toBe("empty");
});

test("CartProvider subscribes to CART_UPDATED event", () => {
  const { cartInputPort, eventBus } = createDeps();
  const { CartProvider } = createCartViewAdapter({ cartInputPort, eventBus });
  render(<CartProvider><TestChild /></CartProvider>);
  expect(eventBus.subscribe).toHaveBeenCalledWith(Events.CART_UPDATED, expect.any(Function));
});

test("useCart throws when used outside CartProvider", () => {
  expect(() => render(<TestChild />)).toThrow("useCart must be used within CartProvider");
});
