/**
 * CategoryDeleted → Product Cleanup Translator.
 * Collaboration adapter (input side of Categories module, consuming side is Products).
 */
import { assertApplicationEvent } from "../../../../../shared/application/contracts/applicationEventContract.js";
import { assertFunction }         from "../../../../../shared/kernel/assertions/index.js";

export const createCategoryDeletedProductCleanupTranslator = ({ removeProductsByCategory }) => {
  assertFunction(
    removeProductsByCategory,
    "removeProductsByCategory",
    "removeProductsByCategory must be a function"
  );

  return {
    async publish(event) {
      assertApplicationEvent(event, { expectedType: "CategoryDeleted" });
      const { categoryId } = event.payload;
      if (!categoryId) return;
      await removeProductsByCategory({ categoryId });
    },
  };
};
