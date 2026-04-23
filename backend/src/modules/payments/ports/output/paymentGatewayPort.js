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

const assertAllowedPaymentGatewayMethods = (requiredMethods, allowedMethods, portName) => {
  for (const methodName of requiredMethods) {
    if (!allowedMethods.has(methodName)) {
      throw new Error(`${portName} must not require ${methodName}`);
    }
  }
};

export const assertRedirectPaymentGatewayPort = (
  paymentGateway,
  requiredMethods = []
) => {
  assertAllowedPaymentGatewayMethods(
    requiredMethods,
    new Set(["createRedirectPayment", "getRedirectPayment", "verifyWebhook"]),
    "redirect payment gateway port"
  );

  return assertPaymentGatewayPort(paymentGateway, requiredMethods);
};
