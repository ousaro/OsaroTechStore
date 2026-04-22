export const createCategoryDeletedProductCleanupTranslator = ({
  removeProductsByCategory,
}) => {
  if (typeof removeProductsByCategory !== "function") {
    throw new Error("removeProductsByCategory is required");
  }

  return {
    async publish(event) {
      if (event?.type !== "CategoryDeleted") {
        return;
      }

      await removeProductsByCategory({
        categoryId: event.payload.categoryId,
      });
    },
  };
};
