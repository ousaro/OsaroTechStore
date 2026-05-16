/**
 * CART — Collaboration Input Adapter: OrderPlacedCartClearTranslator
 *
 * Receives OrderPlaced event → calls cartModule.clearCart().
 * Wired by the composition root ONLY. Cart module never imports orders module.
 */

export function createOrderPlacedCartClearTranslator({ cartModule }) {
  async function handle(event) {
    await cartModule.clearCart();
  }
  return { handle };
}
