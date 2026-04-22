import { applicationEventBus } from "./applicationEventBus.js";
import { createCategoryDeletedProductCleanupTranslator } from "../modules/categories/infrastructure/collaboration/categoryDeletedProductCleanupTranslator.js";
import { createPaymentConfirmedOrderSyncTranslator } from "../modules/orders/infrastructure/collaboration/paymentConfirmedOrderSyncTranslator.js";
import { createOrderPlacedPaymentLinkTranslator } from "../modules/payments/infrastructure/collaboration/orderPlacedPaymentLinkTranslator.js";
import { confirmOrderPayment } from "../modules/orders/public-api.js";
import { linkPaymentToOrder } from "../modules/payments/public-api.js";
import { removeProductsByCategory } from "../modules/products/public-api.js";

export const registerApplicationWorkflows = ({
  eventBus = applicationEventBus,
  createCategoryDeletedTranslator = createCategoryDeletedProductCleanupTranslator,
  createPaymentConfirmedTranslator = createPaymentConfirmedOrderSyncTranslator,
  createOrderPlacedTranslator = createOrderPlacedPaymentLinkTranslator,
  removeProductsByCategoryHandler = removeProductsByCategory,
  confirmOrderPaymentHandler = confirmOrderPayment,
  linkPaymentToOrderHandler = linkPaymentToOrder,
} = {}) => {
  const categoryDeletedProductCleanupTranslator = createCategoryDeletedTranslator({
    removeProductsByCategory: removeProductsByCategoryHandler,
  });
  const paymentConfirmedOrderSyncTranslator = createPaymentConfirmedTranslator({
    confirmOrderPayment: confirmOrderPaymentHandler,
  });
  const orderPlacedPaymentLinkTranslator = createOrderPlacedTranslator({
    linkPaymentToOrder: linkPaymentToOrderHandler,
  });

  return [
    eventBus.subscribe("CategoryDeleted", (event) =>
      categoryDeletedProductCleanupTranslator.publish(event)
    ),
    eventBus.subscribe("OrderPlaced", (event) =>
      orderPlacedPaymentLinkTranslator.publish(event)
    ),
    eventBus.subscribe("PaymentConfirmed", (event) =>
      paymentConfirmedOrderSyncTranslator.publish(event)
    ),
  ];
};
