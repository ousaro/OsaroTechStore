import { assertApplicationEvent } from "../../../../../shared/application/contracts/applicationEventContract.js";

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

      assertApplicationEvent(event, { expectedType: "CategoryDeleted" });

      await removeProductsByCategory({
        categoryId: event.payload.categoryId,
      });
    },
  };
};
