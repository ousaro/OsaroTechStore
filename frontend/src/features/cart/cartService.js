import { Cart } from "./model/Cart.js";
import { CartEvents } from "./model/CartEvents.js";

export function createCartModule({ cart: repo, sessionStore, eventBus, notify }) {
  // In-memory cart state — single source of truth for the cart module
  let _cart = (() => {
    const raw = sessionStore.get();
    return Cart.fromRaw(raw?.cart || []);
  })();

  function _persist(newCart) {
    _cart = newCart;
    sessionStore.patch({ cart: newCart.toJSON() });
    eventBus.publish(CartEvents.updated(newCart));
    return newCart;
  }

  async function _sync(newCart) {
    const { ok, error } = await repo.saveCart(newCart.toJSON());
    if (!ok) { notify.error(error || "Cart sync failed"); throw new Error(error); }
    return _persist(newCart);
  }

  async function addToCart(productId, qty = 1) {
    return _sync(_cart.add(productId, qty));
  }

  async function removeFromCart(productId) {
    return _sync(_cart.remove(productId));
  }

  async function setQuantity(productId, qty) {
    return _sync(_cart.setQty(productId, qty));
  }

  async function clearCart() {
    return _sync(_cart.clear());
  }

  function getCart() { return _cart; }

  const inputPort = { addToCart, removeFromCart, setQuantity, clearCart, getCart };  return inputPort;
}
