export const assertCategoryRepositoryPort = (categoryRepository, requiredMethods = []) => {
  if (!categoryRepository || typeof categoryRepository !== "object") {
    throw new Error("categoryRepository port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof categoryRepository[methodName] !== "function") {
      throw new Error(`categoryRepository port must implement ${methodName}`);
    }
  }

  return categoryRepository;
};
