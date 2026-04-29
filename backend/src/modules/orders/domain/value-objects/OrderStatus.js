/**
 * OrderStatus Value Object.
 * Defines all valid statuses and the allowed transition graph.
 * The state machine lives in the domain — not in a service or controller.
 */
import { DomainValidationError } from "../../../../shared/domain/errors/index.js";

export const ORDER_STATUSES = Object.freeze({
  PENDING:    "pending",
  PROCESSING: "processing",
  SHIPPED:    "shipped",
  DELIVERED:  "delivered",
  CANCELLED:  "cancelled",
});

// Adjacency map: from → Set of allowed tos
export const ALLOWED_ORDER_STATUS_TRANSITIONS = Object.freeze({
  [ORDER_STATUSES.PENDING]:    new Set([ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED]),
  [ORDER_STATUSES.PROCESSING]: new Set([ORDER_STATUSES.SHIPPED,    ORDER_STATUSES.CANCELLED]),
  [ORDER_STATUSES.SHIPPED]:    new Set([ORDER_STATUSES.DELIVERED]),
  [ORDER_STATUSES.DELIVERED]:  new Set(),
  [ORDER_STATUSES.CANCELLED]:  new Set(),
});

const ALLOWED = new Set(Object.values(ORDER_STATUSES));

export const createOrderStatus = (value = ORDER_STATUSES.PENDING) => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : value;

  if (!ALLOWED.has(normalized)) {
    throw new DomainValidationError(
      `Invalid orderStatus "${normalized}". Allowed: ${[...ALLOWED].join(", ")}`
    );
  }

  return Object.freeze({
    value: normalized,

    canTransitionTo(nextStatus) {
      return ALLOWED_ORDER_STATUS_TRANSITIONS[normalized]?.has(nextStatus) ?? false;
    },

    equals(other) {
      return other?.value === normalized;
    },

    toPrimitives() {
      return normalized;
    },

    toString() {
      return normalized;
    },
  });
};
