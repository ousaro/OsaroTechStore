/**
 * Auth Input Port.
 * Defines and validates the auth module's public interface.
 */
const REQUIRED_METHODS = [
  "registerUser",
  "loginUser",
  "listUsers",
  "getUser",
  "updateUser",
  "deleteUser",
];

export const assertAuthInputPort = (port) => {
  if (!port || typeof port !== "object") {
    throw new Error("authInputPort is required");
  }
  for (const method of REQUIRED_METHODS) {
    if (typeof port[method] !== "function") {
      throw new Error(`authInputPort must implement .${method}()`);
    }
  }
  return port;
};

export const createAuthInputPort = (useCases) => assertAuthInputPort(useCases);
