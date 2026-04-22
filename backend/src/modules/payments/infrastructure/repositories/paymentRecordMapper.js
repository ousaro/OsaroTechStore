export const toPaymentRecord = (rawPayment) => {
  if (!rawPayment) {
    return null;
  }

  return {
    id: rawPayment.sessionId,
    paymentReference: rawPayment.paymentReference,
    ...(rawPayment.url ? { url: rawPayment.url } : {}),
    paymentStatus: rawPayment.paymentStatus,
  };
};
