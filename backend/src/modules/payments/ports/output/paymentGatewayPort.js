export const assertPaymentGatewayPort = (paymentGateway, requiredMethods = []) => {
  if (!paymentGateway || typeof paymentGateway !== "object") {
    throw new Error("paymentGateway port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof paymentGateway[methodName] !== "function") {
      throw new Error(`paymentGateway port must implement ${methodName}`);
    }
  }

  return paymentGateway;
};
