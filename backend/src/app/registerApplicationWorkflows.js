import { applicationEventBus } from "./applicationEventBus.js";
import { createCategoryDeletedProductCleanupTranslator } from "../modules/categories/infrastructure/collaboration/categoryDeletedProductCleanupTranslator.js";
import { createPaymentConfirmedOrderSyncTranslator } from "../modules/orders/infrastructure/collaboration/paymentConfirmedOrderSyncTranslator.js";
import { confirmOrderPayment } from "../modules/orders/public-api.js";
import { removeProductsByCategory } from "../modules/products/public-api.js";

export const registerApplicationWorkflows = ({
  eventBus = applicationEventBus,
  createCategoryDeletedTranslator = createCategoryDeletedProductCleanupTranslator,
  createPaymentConfirmedTranslator = createPaymentConfirmedOrderSyncTranslator,
  removeProductsByCategoryHandler = removeProductsByCategory,
  confirmOrderPaymentHandler = confirmOrderPayment,
} = {}) => {
  const categoryDeletedProductCleanupTranslator = createCategoryDeletedTranslator({
    removeProductsByCategory: removeProductsByCategoryHandler,
  });
  const paymentConfirmedOrderSyncTranslator = createPaymentConfirmedTranslator({
    confirmOrderPayment: confirmOrderPaymentHandler,
  });

  return [
    eventBus.subscribe("CategoryDeleted", (event) =>
      categoryDeletedProductCleanupTranslator.publish(event)
    ),
    eventBus.subscribe("PaymentConfirmed", (event) =>
      paymentConfirmedOrderSyncTranslator.publish(event)
    ),
  ];
};
