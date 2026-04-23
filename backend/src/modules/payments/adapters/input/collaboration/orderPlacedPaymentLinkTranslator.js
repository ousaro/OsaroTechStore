import { assertApplicationEvent } from "../../../../../shared/application/contracts/applicationEventContract.js";

export const createOrderPlacedPaymentLinkTranslator = ({
  linkPaymentToOrder,
}) => {
  if (typeof linkPaymentToOrder !== "function") {
    throw new Error("linkPaymentToOrder is required");
  }

  return {
    async publish(event) {
      if (event?.type !== "OrderPlaced") {
        return;
      }

      assertApplicationEvent(event, { expectedType: "OrderPlaced" });

      await linkPaymentToOrder({
        paymentReference: event.payload.paymentReference,
        orderId: event.payload.orderId,
      });
    },
  };
};
