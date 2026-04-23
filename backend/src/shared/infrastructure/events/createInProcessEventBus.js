import { assertApplicationEvent } from "../../application/contracts/applicationEventContract.js";

export const createInProcessEventBus = () => {
  const handlersByType = new Map();

  return {
    subscribe(eventType, handler) {
      if (typeof eventType !== "string" || eventType.trim() === "") {
        throw new Error("eventType is required");
      }

      if (typeof handler !== "function") {
        throw new Error("event handler is required");
      }

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
      assertApplicationEvent(event);

      const eventType = event?.type;

      if (typeof eventType !== "string" || eventType.trim() === "") {
        throw new Error("event.type is required");
      }

      const handlers = handlersByType.get(eventType);

      if (!handlers || handlers.size === 0) {
        return;
      }

      for (const handler of handlers) {
        await handler(event);
      }
    },
  };
};
