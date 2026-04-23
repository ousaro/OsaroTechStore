export const assertPaymentRepositoryPort = (paymentRepository, requiredMethods = []) => {
  if (!paymentRepository || typeof paymentRepository !== "object") {
    throw new Error("paymentRepository port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof paymentRepository[methodName] !== "function") {
      throw new Error(`paymentRepository port must implement ${methodName}`);
    }
  }

  return paymentRepository;
};

const assertAllowedPaymentRepositoryMethods = (requiredMethods, allowedMethods, portName) => {
  for (const methodName of requiredMethods) {
    if (!allowedMethods.has(methodName)) {
      throw new Error(`${portName} must not require ${methodName}`);
    }
  }
};

export const assertPaymentRepositoryQueryPort = (
  paymentRepository,
  requiredMethods = []
) => {
  assertAllowedPaymentRepositoryMethods(
    requiredMethods,
    new Set(["findPaymentSessionById"]),
    "paymentRepository query port"
  );
  return assertPaymentRepositoryPort(paymentRepository, requiredMethods);
};

export const assertPaymentRepositoryCommandPort = (
  paymentRepository,
  requiredMethods = []
) => {
  assertAllowedPaymentRepositoryMethods(
    requiredMethods,
    new Set([
      "savePaymentSession",
      "linkPaymentToOrder",
      "updatePaymentSessionStatus",
      "applyWebhookStateChangeOnce",
    ]),
    "paymentRepository command port"
  );
  return assertPaymentRepositoryPort(paymentRepository, requiredMethods);
};
