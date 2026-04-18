export const assertTokenServicePort = (tokenService, requiredMethods = []) => {
  if (!tokenService || typeof tokenService !== "object") {
    throw new Error("tokenService port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof tokenService[methodName] !== "function") {
      throw new Error(`tokenService port must implement ${methodName}`);
    }
  }

  return tokenService;
};
