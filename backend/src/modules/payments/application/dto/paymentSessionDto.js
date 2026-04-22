export const toPaymentCheckoutRedirectDto = (paymentSession) => {
  return {
    url: paymentSession.url,
  };
};

export const toPaymentSessionDto = (paymentSession) => {
  return {
    id: paymentSession.id,
    ...(paymentSession.paymentReference
      ? { paymentReference: paymentSession.paymentReference }
      : {}),
    ...(paymentSession.url ? { url: paymentSession.url } : {}),
    ...(paymentSession.providerTransactionId
      ? { providerTransactionId: paymentSession.providerTransactionId }
      : {}),
    paymentStatus: paymentSession.paymentStatus,
  };
};
