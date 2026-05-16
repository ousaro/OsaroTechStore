import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REQUIRED_METHODS = Object.freeze([
  "addOrder",
  "updateOrder",
  "deleteOrder",
  "confirmOrderPayment",
  "getAllOrders",
  "getOrderById",
]);

export const assertOrdersInputPort = (port) => {
  assertObject(port, "ordersInputPort", "ordersInputPort is required");

  for (const method of REQUIRED_METHODS) {
    assertFunction(
      port[method],
      `ordersInputPort.${method}`,
      `ordersInputPort must implement .${method}()`
    );
  }

  return port;
};

export const createOrdersInputPort = (useCases) => assertOrdersInputPort(useCases);
