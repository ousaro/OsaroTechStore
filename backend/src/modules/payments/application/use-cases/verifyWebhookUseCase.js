export const buildVerifyWebhookUseCase = ({ paymentGateway }) => {
  return async ({ payload, signature }) => {
    paymentGateway.verifyWebhook(payload, signature);
    return { received: true };
  };
};
