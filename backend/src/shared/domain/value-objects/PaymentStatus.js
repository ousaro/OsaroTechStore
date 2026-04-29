/**
 * PaymentStatus — Shared Kernel Value Object.
 *
 * WHY here and not in payments/domain:
 *   The Orders module needs to track payment status on an order record.
 *   If PaymentStatus lived inside payments/domain, Orders would have a
 *   hard cross-module domain import — violating bounded context isolation.
 *   Placing it in the shared kernel makes it neutral: both modules import
 *   from the same canonical definition with no circular dependency.
 */

import { DomainValidationError } from "../errors/index.js";

export const PAYMENT_STATUSES = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  EXPIRED: "expired",
});

const ALLOWED = new Set(Object.values(PAYMENT_STATUSES));

export const createPaymentStatus = (value = PAYMENT_STATUSES.PENDING) => {
  if (typeof value !== "string" || value.trim() === "") {
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
