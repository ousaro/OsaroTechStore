export const assertAuthUserRepositoryPort = (authUserRepository, requiredMethods = []) => {
  if (!authUserRepository || typeof authUserRepository !== "object") {
    throw new Error("authUserRepository port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof authUserRepository[methodName] !== "function") {
      throw new Error(`authUserRepository port must implement ${methodName}`);
    }
  }

  return authUserRepository;
};
