export const createPaymentExpiredOrderSyncTranslator = ({
  handlePaymentExpiration,
}) => {
  if (typeof handlePaymentExpiration !== "function") {
    throw new Error("handlePaymentExpiration is required");
  }

  return {
    async publish(event) {
      if (event?.type !== "PaymentExpired") {
        return;
      }

      await handlePaymentExpiration({
        paymentReference: event.payload.paymentReference ?? event.payload.sessionId,
        eventId: event.payload.eventId,
      });
    },
  };
};
