import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REQUIRED_QUERIES = Object.freeze(["getPaymentByOrderId"]);

export const assertPaymentsQueriesPort = (port) => {
  assertObject(port, "paymentsQueriesPort", "paymentsQueriesPort is required");
  for (const method of REQUIRED_QUERIES) {
    assertFunction(
      port[method],
      `paymentsQueriesPort.${method}`,
      `paymentsQueriesPort must implement .${method}()`
    );
  }
  return port;
};

export const createPaymentsQueriesPort = (useCases) => assertPaymentsQueriesPort(useCases);
