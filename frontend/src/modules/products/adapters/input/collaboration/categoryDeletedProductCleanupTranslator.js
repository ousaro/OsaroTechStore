/**
 * PRODUCTS — Collaboration Input Adapter: CategoryDeletedProductCleanupTranslator
 *
 * Mirror of backend collaboration translators.
 * Receives CategoryDeleted event from the event bus and calls
 * products module's removeProductsByCategory — without products
 * importing anything from categories.
 *
 * Wired by the composition root ONLY.
 */

export function createCategoryDeletedProductCleanupTranslator({ productsModule }) {
  async function handle(event) {
    const { categoryName } = event.payload;
    await productsModule.removeProductsByCategory(categoryName);
  }

  return { handle };
}
