import { assertApplicationEvent } from "../../../../../shared/application/contracts/applicationEventContract.js";

export const createPaymentFailedOrderSyncTranslator = ({
  handlePaymentFailure,
}) => {
  if (typeof handlePaymentFailure !== "function") {
    throw new Error("handlePaymentFailure is required");
  }

  return {
    async publish(event) {
      if (event?.type !== "PaymentFailed") {
        return;
      }

      assertApplicationEvent(event, { expectedType: "PaymentFailed" });

      await handlePaymentFailure({
        paymentReference: event.payload.paymentReference ?? event.payload.sessionId,
        eventId: event.payload.eventId,
      });
    },
  };
};
