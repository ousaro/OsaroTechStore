/**
 * OrderPlaced → Payment Link Translator.
 *
 * Collaboration adapter (input side of Payments module).
 * Subscribes to OrderPlaced events and creates a payment session.
 * Anti-Corruption Layer: Payments module never imports from Orders.
 */
import { assertApplicationEvent } from "../../../../../shared/application/contracts/applicationEventContract.js";
import { assertFunction }         from "../../../../../shared/kernel/assertions/index.js";

export const createOrderPlacedPaymentLinkTranslator = ({ linkPaymentToOrder }) => {
  assertFunction(
    linkPaymentToOrder,
    "linkPaymentToOrder",
    "createOrderPlacedPaymentLinkTranslator: linkPaymentToOrder must be a function"
  );

  return {
    async publish(event) {
      assertApplicationEvent(event, { expectedType: "OrderPlaced" });
      const { orderId, orderLines, currency } = event.payload;
      if (!orderId || !orderLines) return;
      await linkPaymentToOrder({ orderId, orderLines, currency });
    },
  };
};
