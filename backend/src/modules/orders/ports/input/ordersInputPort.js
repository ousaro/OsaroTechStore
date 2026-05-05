/**
 * Orders Input Port.
 * Defines the public interface exposed to HTTP controllers.
 */
import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const COMMAND_METHODS = ["addOrder", "updateOrder", "deleteOrder", "confirmOrderPayment"];
const QUERY_METHODS   = ["getAllOrders", "getOrderById"];

const assertMethods = (obj, methods, label) => {
  assertObject(obj, label, `${label} is required`);
  for (const m of methods) {
    assertFunction(obj[m], `${label}.${m}`, `${label} must implement .${m}()`);
  }
  return obj;
};

export const createOrdersCommandPort = (useCases) =>
  assertMethods(useCases, COMMAND_METHODS, "ordersCommandPort");

export const createOrdersQueryPort = (useCases) =>
  assertMethods(useCases, QUERY_METHODS, "ordersQueryPort");
