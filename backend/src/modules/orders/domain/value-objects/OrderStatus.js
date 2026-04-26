import { assertNonEmptyString } from "../../../../shared/infrastructure/assertions";
import { OrderStatusNotAllowedError } from "../errors/OrderStatusNotAllowedError.js"

export const ALLOWED_ORDER_STATUSES = new Set([
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);


export const createOrderStatus = (value) => {
  assertNonEmptyString(value, "status");

  const normalizedValue = value.trim().toLowerCase();

  if (!ALLOWED_ORDER_STATUSES.has(normalizedValue)) {
    throw new OrderStatusNotAllowedError("Invalid order status");
  }

  return Object.freeze({
    value: normalizedValue,
    toPrimitives() {
      return normalizedValue;
    },
    toString() {
      return normalizedValue;
    },
  });
};
