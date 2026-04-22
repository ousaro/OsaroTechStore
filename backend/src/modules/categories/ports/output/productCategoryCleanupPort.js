export const assertProductCategoryCleanupPort = (
  productCategoryCleanup,
  requiredMethods = []
) => {
  if (!productCategoryCleanup || typeof productCategoryCleanup !== "object") {
    throw new Error("productCategoryCleanup port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof productCategoryCleanup[methodName] !== "function") {
      throw new Error(`productCategoryCleanup port must implement ${methodName}`);
    }
  }

  return productCategoryCleanup;
};
