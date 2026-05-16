
import { DomainValidationError } from "../errors/index.js";
import { assertNonEmptyString } from "../../kernel/assertions/index.js";

export const PAYMENT_STATUSES = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  EXPIRED: "expired",
});

const ALLOWED = new Set(Object.values(PAYMENT_STATUSES));

export const createPaymentStatus = (value = PAYMENT_STATUSES.PENDING) => {
  try {
    assertNonEmptyString(value, "paymentStatus");
  } catch (_err) {
    throw new DomainValidationError("paymentStatus must be a non-empty string");
  }

  const normalized = value.trim().toLowerCase();

  if (!ALLOWED.has(normalized)) {
    throw new DomainValidationError(
      `Invalid paymentStatus "${normalized}". Allowed: ${[...ALLOWED].join(", ")}`
    );
  }

  return Object.freeze({
    value: normalized,
    toPrimitives() {
      return normalized;
    },
    toString() {
      return normalized;
    },
    equals(other) {
      return other?.value === normalized;
    },
  });
};
