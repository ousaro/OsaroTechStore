/**
 * Domain Event Envelope — Shared Kernel.
 *
 * Every domain event is wrapped in this envelope.
 * Provides: id (for deduplication), type, occurredAt, version, correlationId.
 *
 * Usage:
 *   import { createDomainEvent } from "@shared/domain/events/createDomainEvent.js";
 *   export const createOrderPlacedEvent = (order) =>
 *     createDomainEvent("OrderPlaced", { orderId: order._id, ... });
 */

import { randomUUID } from "crypto";
import { assertNonEmptyString, assertObject } from "../../kernel/assertions/index.js";

export const createDomainEvent = (type, payload, meta = {}) => {
  assertNonEmptyString(type, "type", "Domain event type must be a non-empty string");
  assertObject(payload, "payload", "Domain event payload must be an object");

  return Object.freeze({
    id: meta.id ?? randomUUID(), // unique event ID — used for idempotency
    type,
    occurredAt: meta.occurredAt ?? new Date().toISOString(),
    version: meta.version ?? 1, // schema version — bump when payload shape changes
    correlationId: meta.correlationId ?? null, // for distributed tracing
    payload: Object.freeze({ ...payload }),
  });
};
