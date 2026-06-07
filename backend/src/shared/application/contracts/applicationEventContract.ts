import { assertNonEmptyString, assertObject } from "../../kernel/assertions/index.js";

interface ApplicationEvent {
  id?: string;
  type: string;
  payload: Record<string, unknown>;
}

interface AssertOptions {
  expectedType?: string;
}

export const assertApplicationEvent = (
  event: unknown,
  { expectedType }: AssertOptions = {}
): ApplicationEvent => {
  assertObject(event, "event", "event must be a non-null object");
  const ev = event as ApplicationEvent;
  assertNonEmptyString(ev.type, "event.type", "event.type must be a non-empty string");

  if (expectedType && ev.type !== expectedType) {
    throw new Error(`Expected event type "${expectedType}" but received "${ev.type}"`);
  }

  assertObject(ev.payload, "event.payload", "event.payload must be a non-null object");

  if (!ev.id) {
    console.warn(
      `[EventBus] Warning: event of type "${ev.type}" is missing an id. ` +
        "Use createDomainEvent() to create events."
    );
  }

  return ev;
};
