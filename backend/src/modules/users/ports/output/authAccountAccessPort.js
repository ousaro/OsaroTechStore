export const assertAuthAccountAccessPort = (authAccountAccess, requiredMethods = []) => {
  if (!authAccountAccess || typeof authAccountAccess !== "object") {
    throw new Error("authAccountAccess port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof authAccountAccess[methodName] !== "function") {
      throw new Error(`authAccountAccess port must implement ${methodName}`);
    }
  }

  return authAccountAccess;
};
