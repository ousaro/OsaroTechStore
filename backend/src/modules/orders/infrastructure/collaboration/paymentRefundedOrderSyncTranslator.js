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

      await handlePaymentRefund({
        paymentReference: event.payload.paymentReference ?? event.payload.sessionId,
        eventId: event.payload.eventId,
      });
    },
  };
};
