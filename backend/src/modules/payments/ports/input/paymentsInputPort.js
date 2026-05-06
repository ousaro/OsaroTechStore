import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REQUIRED_METHODS = Object.freeze([
  "createPaymentIntent",
  "verifyWebhook",
  "linkPaymentToOrder",
  "getPaymentByOrderId",
]);

export const assertPaymentsInputPort = (port) => {
  assertObject(port, "paymentsInputPort", "paymentsInputPort is required");

  for (const method of REQUIRED_METHODS) {
    assertFunction(
      port[method],
      `paymentsInputPort.${method}`,
      `paymentsInputPort must implement .${method}()`
    );
  }

  return port;
};

export const createPaymentsInputPort = (useCases) => assertPaymentsInputPort(useCases);
