import { randomUUID } from "crypto";
import { assertNonEmptyString, assertObject } from "../../kernel/assertions/index.js";

export const createDomainEvent = (type, payload, meta = {}) => {
  assertNonEmptyString(type, "type", "Domain event type must be a non-empty string");
  assertObject(payload, "payload", "Domain event payload must be an object");

  return Object.freeze({
    id: meta.id ?? randomUUID(),
    type,
    occurredAt: meta.occurredAt ?? new Date().toISOString(),
    version: meta.version ?? 1,
    correlationId: meta.correlationId ?? null,
    payload: Object.freeze({ ...payload }),
  });
};
