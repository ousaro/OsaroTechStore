export function createOrderPlacedCartClearTranslator({ cartModule }) {
  async function handle(event) {
    await cartModule.clearCart();
  }
  return { handle };
}
