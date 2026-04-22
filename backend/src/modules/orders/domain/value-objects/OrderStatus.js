import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const ALLOWED_ORDER_STATUSES = new Set([
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const createOrderStatus = (value) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new DomainValidationError("status is required");
  }

  const normalizedValue = value.trim().toLowerCase();

  if (!ALLOWED_ORDER_STATUSES.has(normalizedValue)) {
    throw new DomainValidationError("Invalid order status");
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
