export const assertOrderEventPublisherPort = (
  orderEventPublisher,
  requiredMethods = []
) => {
  if (!orderEventPublisher || typeof orderEventPublisher !== "object") {
    throw new Error("orderEventPublisher port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof orderEventPublisher[methodName] !== "function") {
      throw new Error(`orderEventPublisher port must implement ${methodName}`);
    }
  }

  return orderEventPublisher;
};
