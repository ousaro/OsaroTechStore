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
    paymentStatus: paymentSession.paymentStatus,
  };
};
