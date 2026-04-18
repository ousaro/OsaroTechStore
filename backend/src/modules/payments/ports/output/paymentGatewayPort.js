export const assertPaymentGatewayPort = (paymentGateway) => {
  if (!paymentGateway || typeof paymentGateway !== "object") {
    throw new Error("paymentGateway port is required");
  }

  const requiredMethods = ["createCheckoutSession", "verifyWebhook", "getCheckoutSession"];

  for (const methodName of requiredMethods) {
    if (typeof paymentGateway[methodName] !== "function") {
      throw new Error(`paymentGateway port must implement ${methodName}`);
    }
  }

  return paymentGateway;
};
