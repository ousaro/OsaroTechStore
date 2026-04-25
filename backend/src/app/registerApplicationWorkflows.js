import { handlePaymentConfirmed } from "../modules/payments/application/handlers/handlePaymentConfirmed.js";
import { handlePaymentFailed } from "../modules/payments/application/handlers/handlePaymentFailed.js";
import { handlePaymentExpired } from "../modules/payments/application/handlers/handlePaymentExpired.js";
import { handlePaymentRefunded } from "../modules/payments/application/handlers/handlePaymentRefunded.js";
import { handleOrderPlaced } from "../modules/orders/application/handlers/handleOrderPlaced.js";
import { handleCategoryDeleted } from "../modules/categories/application/handlers/handleCategoryDeleted.js";

export const registerApplicationWorkflows = ({ eventBus }) => {
  eventBus.subscribe("CategoryDeleted", handleCategoryDeleted);

  eventBus.subscribe("OrderPlaced", handleOrderPlaced);

  eventBus.subscribe("PaymentConfirmed", handlePaymentConfirmed);

  eventBus.subscribe("PaymentFailed", handlePaymentFailed);

  eventBus.subscribe("PaymentExpired", handlePaymentExpired);

  eventBus.subscribe("PaymentRefunded", handlePaymentRefunded);
};