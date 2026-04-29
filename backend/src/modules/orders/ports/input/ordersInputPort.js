/**
 * Orders Input Port.
 * Defines the public interface exposed to HTTP controllers.
 */
const COMMAND_METHODS = ["addOrder", "updateOrder", "deleteOrder", "confirmOrderPayment"];
const QUERY_METHODS   = ["getAllOrders", "getOrderById"];

const assertMethods = (obj, methods, label) => {
  if (!obj || typeof obj !== "object") throw new Error(`${label} is required`);
  for (const m of methods) {
    if (typeof obj[m] !== "function")
      throw new Error(`${label} must implement .${m}()`);
  }
  return obj;
};

export const createOrdersCommandPort = (useCases) =>
  assertMethods(useCases, COMMAND_METHODS, "ordersCommandPort");

export const createOrdersQueryPort = (useCases) =>
  assertMethods(useCases, QUERY_METHODS, "ordersQueryPort");
