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
