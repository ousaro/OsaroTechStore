export function createCategoryDeletedProductCleanupTranslator({ productsModule }) {
  async function handle(event) {
    const { categoryName } = event.payload;
    await productsModule.removeProductsByCategory(categoryName);
  }

  return { handle };
}
