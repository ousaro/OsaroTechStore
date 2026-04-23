import { assertApplicationEvent } from "../../../../shared/application/contracts/applicationEventContract.js";

export const createPaymentRefundedOrderSyncTranslator = ({
  handlePaymentRefund,
}) => {
  if (typeof handlePaymentRefund !== "function") {
    throw new Error("handlePaymentRefund is required");
  }

  return {
    async publish(event) {
      if (event?.type !== "PaymentRefunded") {
        return;
      }

      assertApplicationEvent(event, { expectedType: "PaymentRefunded" });

      await handlePaymentRefund({
        paymentReference: event.payload.paymentReference ?? event.payload.sessionId,
        eventId: event.payload.eventId,
      });
    },
  };
};
