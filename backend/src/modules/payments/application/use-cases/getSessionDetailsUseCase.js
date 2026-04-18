export const buildGetSessionDetailsUseCase = ({ paymentGateway }) => {
  return async ({ sessionId }) => {
    return paymentGateway.getCheckoutSession(sessionId);
  };
};
