export const assertProductRepositoryPort = (productRepository, requiredMethods = []) => {
  if (!productRepository || typeof productRepository !== "object") {
    throw new Error("productRepository port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof productRepository[methodName] !== "function") {
      throw new Error(`productRepository port must implement ${methodName}`);
    }
  }

  return productRepository;
};
