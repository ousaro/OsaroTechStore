import { applicationEventBus } from "./applicationEventBus.js";
import { createCategoryDeletedProductCleanupTranslator } from "../modules/categories/infrastructure/collaboration/categoryDeletedProductCleanupTranslator.js";
import { removeProductsByCategory } from "../modules/products/public-api.js";

export const registerApplicationWorkflows = ({
  eventBus = applicationEventBus,
  createCategoryDeletedTranslator = createCategoryDeletedProductCleanupTranslator,
  removeProductsByCategoryHandler = removeProductsByCategory,
} = {}) => {
  const categoryDeletedProductCleanupTranslator = createCategoryDeletedTranslator({
    removeProductsByCategory: removeProductsByCategoryHandler,
  });

  return [
    eventBus.subscribe("CategoryDeleted", (event) =>
      categoryDeletedProductCleanupTranslator.publish(event)
    ),
  ];
};
