import { assertFunction, assertNonEmptyString } from "../assertions";

export const createInProcessEventBus = () => {
  const handlersByType = new Map();

  return {
    subscribe(eventType, handler) {
      assertNonEmptyString(eventType, "eventType");
      assertFunction(handler, "handler");

      const handlers = handlersByType.get(eventType) ?? new Set();
      handlers.add(handler);
      handlersByType.set(eventType, handlers);

      return () => {
        handlers.delete(handler);

        if (handlers.size === 0) {
          handlersByType.delete(eventType);
        }
      };
    },

    async publish(event) {
      const eventType = event?.type;

      assertNonEmptyString(eventType, "event.type");

      const handlers = handlersByType.get(eventType);

      if (!handlers) return;

      for (const handler of handlers) {
        await handler(event);
      }
    },
  };
};