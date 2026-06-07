import { DomainValidationError } from "../errors/index.js";
import { assertNonEmptyString } from "../../kernel/assertions/index.js";

export const PAYMENT_STATUSES = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  EXPIRED: "expired",
} as const);

export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

const ALLOWED = new Set(Object.values(PAYMENT_STATUSES));

interface PaymentStatus {
  value: PaymentStatusValue;
  toPrimitives(): PaymentStatusValue;
  toString(): PaymentStatusValue;
  equals(other: { value: string } | null): boolean;
}

export const createPaymentStatus = (value: string = PAYMENT_STATUSES.PENDING): PaymentStatus => {
  try {
    assertNonEmptyString(value, "paymentStatus");
  } catch {
    throw new DomainValidationError("paymentStatus must be a non-empty string");
  }

  const normalized = value.trim().toLowerCase() as PaymentStatusValue;

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
    equals(other: { value: string } | null) {
      return other?.value === normalized;
    },
  });
};
