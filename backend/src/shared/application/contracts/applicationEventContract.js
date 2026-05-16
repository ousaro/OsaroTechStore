import { assertNonEmptyString, assertObject } from "../../kernel/assertions/index.js";

export const assertApplicationEvent = (event, { expectedType } = {}) => {
  assertObject(event, "event", "event must be a non-null object");
  assertNonEmptyString(event.type, "event.type", "event.type must be a non-empty string");

  if (expectedType && event.type !== expectedType) {
    throw new Error(`Expected event type "${expectedType}" but received "${event.type}"`);
  }

  assertObject(event.payload, "event.payload", "event.payload must be a non-null object");

  if (!event.id) {
    console.warn(
      `[EventBus] Warning: event of type "${event.type}" is missing an id. ` +
        "Use createDomainEvent() to create events."
    );
  }

  return event;
};
