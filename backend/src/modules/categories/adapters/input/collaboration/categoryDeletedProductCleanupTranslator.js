/**
 * CategoryDeleted → Product Cleanup Translator.
 * Collaboration adapter (input side of Categories module, consuming side is Products).
 */
import { assertApplicationEvent } from "../../../../../shared/application/contracts/applicationEventContract.js";

export const createCategoryDeletedProductCleanupTranslator = ({ removeProductsByCategory }) => {
  if (typeof removeProductsByCategory !== "function") {
    throw new Error("removeProductsByCategory must be a function");
  }
  return {
    async publish(event) {
      assertApplicationEvent(event, { expectedType: "CategoryDeleted" });
      const { categoryId } = event.payload;
      if (!categoryId) return;
      await removeProductsByCategory({ categoryId });
    },
  };
};
