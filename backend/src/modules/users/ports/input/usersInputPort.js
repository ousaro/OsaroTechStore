import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REQUIRED_METHODS = Object.freeze([
  "getUserProfile",
  "updateUserProfile",
  "updateUserCart",
  "updateUserFavorites",
]);

export const assertUsersInputPort = (port) => {
  assertObject(port, "usersInputPort", "usersInputPort is required");

  for (const method of REQUIRED_METHODS) {
    assertFunction(
      port[method],
      `usersInputPort.${method}`,
      `usersInputPort must implement .${method}()`
    );
  }

  return port;
};

export const createUsersInputPort = (useCases) => assertUsersInputPort(useCases);
