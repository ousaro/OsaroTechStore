import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REQUIRED_METHODS = [
  "registerUser",
  "loginUser",
  "listUsers",
  "getUser",
  "updateUser",
  "deleteUser",
];

export const assertAuthInputPort = (port) => {
  assertObject(port, "authInputPort", "authInputPort is required");

  for (const method of REQUIRED_METHODS) {
    assertFunction(
      port[method],
      `authInputPort.${method}`,
      `authInputPort must implement .${method}()`
    );
  }
  return port;
};

export const createAuthInputPort = (useCases) => assertAuthInputPort(useCases);
