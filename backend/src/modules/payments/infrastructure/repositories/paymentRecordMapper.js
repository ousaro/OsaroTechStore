export const toPaymentRecord = (rawPayment) => {
  if (!rawPayment) {
    return null;
  }

  return {
    id: rawPayment.sessionId,
    ...(rawPayment.url ? { url: rawPayment.url } : {}),
    paymentStatus: rawPayment.paymentStatus,
  };
};
