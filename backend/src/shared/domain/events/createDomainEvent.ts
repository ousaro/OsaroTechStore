import { randomUUID } from "crypto";
import { assertNonEmptyString, assertObject } from "../../kernel/assertions/index.js";

export interface DomainEvent {
  id: string;
  type: string;
  occurredAt: string;
  version: number;
  correlationId: string | null;
  payload: Readonly<Record<string, unknown>>;
}

interface EventMeta {
  id?: string;
  occurredAt?: string;
  version?: number;
  correlationId?: string | null;
}

export const createDomainEvent = (
  type: string,
  payload: Record<string, unknown>,
  meta: EventMeta = {}
): DomainEvent => {
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
