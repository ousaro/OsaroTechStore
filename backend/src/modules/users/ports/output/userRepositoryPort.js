export const assertUserRepositoryPort = (userRepository, requiredMethods = []) => {
  if (!userRepository || typeof userRepository !== "object") {
    throw new Error("userRepository port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof userRepository[methodName] !== "function") {
      throw new Error(`userRepository port must implement ${methodName}`);
    }
  }

  return userRepository;
};
