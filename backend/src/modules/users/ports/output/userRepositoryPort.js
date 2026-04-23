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

const assertAllowedUserRepositoryMethods = (requiredMethods, allowedMethods, portName) => {
  for (const methodName of requiredMethods) {
    if (!allowedMethods.has(methodName)) {
      throw new Error(`${portName} must not require ${methodName}`);
    }
  }
};

export const assertUserRepositoryQueryPort = (userRepository, requiredMethods = []) => {
  assertAllowedUserRepositoryMethods(
    requiredMethods,
    new Set(["isValidId", "findAllNonAdminSorted", "findById", "getCredentialsById"]),
    "userRepository query port"
  );
  return assertUserRepositoryPort(userRepository, requiredMethods);
};

export const assertUserRepositoryCommandPort = (userRepository, requiredMethods = []) => {
  assertAllowedUserRepositoryMethods(
    requiredMethods,
    new Set(["findByIdAndUpdate", "findByIdAndDelete", "updateCredentialsById", "hashPassword", "comparePassword"]),
    "userRepository command port"
  );
  return assertUserRepositoryPort(userRepository, requiredMethods);
};
