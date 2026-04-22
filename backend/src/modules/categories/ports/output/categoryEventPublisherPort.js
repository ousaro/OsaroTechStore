export const assertCategoryEventPublisherPort = (
  categoryEventPublisher,
  requiredMethods = []
) => {
  if (!categoryEventPublisher || typeof categoryEventPublisher !== "object") {
    throw new Error("categoryEventPublisher port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof categoryEventPublisher[methodName] !== "function") {
      throw new Error(`categoryEventPublisher port must implement ${methodName}`);
    }
  }

  return categoryEventPublisher;
};
