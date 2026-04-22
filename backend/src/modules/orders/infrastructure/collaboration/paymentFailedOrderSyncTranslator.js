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

      await handlePaymentFailure({
        paymentReference: event.payload.paymentReference ?? event.payload.sessionId,
        eventId: event.payload.eventId,
      });
    },
  };
};
