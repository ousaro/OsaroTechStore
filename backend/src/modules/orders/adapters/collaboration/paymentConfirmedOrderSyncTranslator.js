import { assertApplicationEvent } from "../../../../shared/application/contracts/applicationEventContract.js";

export const createPaymentConfirmedOrderSyncTranslator = ({
  confirmOrderPayment,
}) => {
  if (typeof confirmOrderPayment !== "function") {
    throw new Error("confirmOrderPayment is required");
  }

  return {
    async publish(event) {
      if (event?.type !== "PaymentConfirmed") {
        return;
      }

      assertApplicationEvent(event, { expectedType: "PaymentConfirmed" });

      await confirmOrderPayment({
        paymentReference: event.payload.paymentReference ?? event.payload.sessionId,
        eventId: event.payload.eventId,
      });
    },
  };
};
