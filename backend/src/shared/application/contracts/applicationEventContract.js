/**
 * Application Event Contract.
 *
 * Used by collaboration translators (input adapters that subscribe to events
 * from other modules) to validate that an incoming event has the expected shape
 * before acting on it.
 *
 * This is the Anti-Corruption Layer guard for the event bus.
 */

import { assertNonEmptyString, assertObject } from "../../kernel/assertions/index.js";

export const assertApplicationEvent = (event, { expectedType } = {}) => {
  assertObject(event, "event", "event must be a non-null object");
  assertNonEmptyString(event.type, "event.type", "event.type must be a non-empty string");

  if (expectedType && event.type !== expectedType) {
    throw new Error(`Expected event type "${expectedType}" but received "${event.type}"`);
  }

  assertObject(event.payload, "event.payload", "event.payload must be a non-null object");

  // Events created via createDomainEvent() always have id + occurredAt.
  // Log a warning (not a throw) if missing — backwards compatibility.
  if (!event.id) {
    console.warn(
      `[EventBus] Warning: event of type "${event.type}" is missing an id. ` +
        "Use createDomainEvent() to create events."
    );
  }

  return event;
};
