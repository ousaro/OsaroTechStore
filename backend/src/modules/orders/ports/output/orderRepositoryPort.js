export const assertOrderRepositoryPort = (orderRepository, requiredMethods = []) => {
  if (!orderRepository || typeof orderRepository !== "object") {
    throw new Error("orderRepository port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof orderRepository[methodName] !== "function") {
      throw new Error(`orderRepository port must implement ${methodName}`);
    }
  }

  return orderRepository;
};
