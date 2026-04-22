export const assertPaymentEventPublisherPort = (
  paymentEventPublisher,
  requiredMethods = []
) => {
  if (!paymentEventPublisher || typeof paymentEventPublisher !== "object") {
    throw new Error("paymentEventPublisher port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof paymentEventPublisher[methodName] !== "function") {
      throw new Error(`paymentEventPublisher port must implement ${methodName}`);
    }
  }

  return paymentEventPublisher;
};
