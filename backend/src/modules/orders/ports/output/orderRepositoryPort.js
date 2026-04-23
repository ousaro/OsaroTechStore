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

const assertAllowedOrderRepositoryMethods = (requiredMethods, allowedMethods, portName) => {
  for (const methodName of requiredMethods) {
    if (!allowedMethods.has(methodName)) {
      throw new Error(`${portName} must not require ${methodName}`);
    }
  }
};

export const assertOrderRepositoryQueryPort = (orderRepository, requiredMethods = []) => {
  assertAllowedOrderRepositoryMethods(
    requiredMethods,
    new Set(["isValidId", "findAllSorted", "findById", "findByPaymentReference"]),
    "orderRepository query port"
  );
  return assertOrderRepositoryPort(orderRepository, requiredMethods);
};

export const assertOrderRepositoryCommandPort = (orderRepository, requiredMethods = []) => {
  assertAllowedOrderRepositoryMethods(
    requiredMethods,
    new Set(["create", "findByIdAndUpdate", "findByIdAndDelete"]),
    "orderRepository command port"
  );
  return assertOrderRepositoryPort(orderRepository, requiredMethods);
};
