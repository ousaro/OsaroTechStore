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

      if (!event.payload?.paymentReference) {
        return;
      }

      await linkPaymentToOrder({
        paymentReference: event.payload.paymentReference,
        orderId: event.payload.orderId,
      });
    },
  };
};
