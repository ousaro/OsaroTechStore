import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REQUIRED_COMMANDS = Object.freeze([
  "createPaymentIntent",
  "verifyWebhook",
  "linkPaymentToOrder",
]);

export const assertPaymentsCommandsPort = (port) => {
  assertObject(port, "paymentsCommandsPort", "paymentsCommandsPort is required");
  for (const method of REQUIRED_COMMANDS) {
    assertFunction(
      port[method],
      `paymentsCommandsPort.${method}`,
      `paymentsCommandsPort must implement .${method}()`
    );
  }
  return port;
};

export const createPaymentsCommandsPort = (useCases) => assertPaymentsCommandsPort(useCases);
