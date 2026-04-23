import { applicationEventBus } from "./applicationEventBus.js";
import { createCategoryDeletedProductCleanupTranslator } from "../modules/categories/public-api.js";
import {
  confirmOrderPayment,
  createPaymentConfirmedOrderSyncTranslator,
  createPaymentExpiredOrderSyncTranslator,
  createPaymentFailedOrderSyncTranslator,
  createPaymentRefundedOrderSyncTranslator,
  handlePaymentExpiration,
  handlePaymentFailure,
  handlePaymentRefund,
} from "../modules/orders/public-api.js";
import {
  createOrderPlacedPaymentLinkTranslator,
  linkPaymentToOrder,
} from "../modules/payments/public-api.js";
import { removeProductsByCategory } from "../modules/products/public-api.js";

export const registerApplicationWorkflows = ({
  eventBus = applicationEventBus,
  createCategoryDeletedTranslator = createCategoryDeletedProductCleanupTranslator,
  createPaymentConfirmedTranslator = createPaymentConfirmedOrderSyncTranslator,
  createPaymentFailedTranslator = createPaymentFailedOrderSyncTranslator,
  createPaymentExpiredTranslator = createPaymentExpiredOrderSyncTranslator,
  createPaymentRefundedTranslator = createPaymentRefundedOrderSyncTranslator,
  createOrderPlacedTranslator = createOrderPlacedPaymentLinkTranslator,
  removeProductsByCategoryHandler = removeProductsByCategory,
  confirmOrderPaymentHandler = confirmOrderPayment,
  handlePaymentFailureHandler = handlePaymentFailure,
  handlePaymentExpirationHandler = handlePaymentExpiration,
  handlePaymentRefundHandler = handlePaymentRefund,
  linkPaymentToOrderHandler = linkPaymentToOrder,
} = {}) => {
  const categoryDeletedProductCleanupTranslator = createCategoryDeletedTranslator({
    removeProductsByCategory: removeProductsByCategoryHandler,
  });
  const paymentConfirmedOrderSyncTranslator = createPaymentConfirmedTranslator({
    confirmOrderPayment: confirmOrderPaymentHandler,
  });
  const paymentFailedOrderSyncTranslator = createPaymentFailedTranslator({
    handlePaymentFailure: handlePaymentFailureHandler,
  });
  const paymentExpiredOrderSyncTranslator = createPaymentExpiredTranslator({
    handlePaymentExpiration: handlePaymentExpirationHandler,
  });
  const paymentRefundedOrderSyncTranslator = createPaymentRefundedTranslator({
    handlePaymentRefund: handlePaymentRefundHandler,
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
    eventBus.subscribe("PaymentFailed", (event) =>
      paymentFailedOrderSyncTranslator.publish(event)
    ),
    eventBus.subscribe("PaymentExpired", (event) =>
      paymentExpiredOrderSyncTranslator.publish(event)
    ),
    eventBus.subscribe("PaymentRefunded", (event) =>
      paymentRefundedOrderSyncTranslator.publish(event)
    ),
  ];
};
