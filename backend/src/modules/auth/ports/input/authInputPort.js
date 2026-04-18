export const createAuthInputPort = ({ registerUser, loginUser }) => {
  return assertAuthInputPort({
    registerUser,
    loginUser,
  });
};

export const assertAuthInputPort = (authInputPort) => {
  if (!authInputPort || typeof authInputPort !== "object") {
    throw new Error("authInputPort is required");
  }

  const requiredMethods = ["registerUser", "loginUser"];

  for (const methodName of requiredMethods) {
    if (typeof authInputPort[methodName] !== "function") {
      throw new Error(`authInputPort must implement ${methodName}`);
    }
  }

  return authInputPort;
};
