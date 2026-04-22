export const toPaymentCheckoutRedirectDto = (paymentSession) => {
  return {
    url: paymentSession.url,
  };
};

export const toPaymentSessionDto = (paymentSession) => {
  return {
    id: paymentSession.id,
    ...(paymentSession.url ? { url: paymentSession.url } : {}),
    paymentStatus: paymentSession.paymentStatus,
  };
};
