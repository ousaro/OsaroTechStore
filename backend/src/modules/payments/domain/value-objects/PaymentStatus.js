import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const ALLOWED_PAYMENT_STATUSES = new Set([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const createPaymentStatus = (value = "pending") => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new DomainValidationError("paymentStatus is required");
  }

  const normalizedValue = value.trim().toLowerCase();

  if (!ALLOWED_PAYMENT_STATUSES.has(normalizedValue)) {
    throw new DomainValidationError("Invalid payment status");
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
