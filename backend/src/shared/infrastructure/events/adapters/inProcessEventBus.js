/**
 * In-Process Event Bus Adapter.
 *
 * Implements the EventBus port for single-process deployments (monolith, dev).
 *
 * CRITICAL FIXES vs original:
 *  1. Handler isolation — uses Promise.allSettled() so one failing handler
 *     never blocks others. Each handler failure is logged, not propagated.
 *  2. The publisher is NOT coupled to handler outcomes. A domain event that
 *     published successfully should not roll back because a side-effect failed.
 *  3. Subscriptions are stored per event type in a Map<string, Set<Function>>.
 *
 * To switch to Redis Streams or RabbitMQ:
 *   Replace this file's factory in infrastructure/providers/events/resolveEventBus.js.
 *   All module code stays the same — they only know the port interface.
 */

export const createInProcessEventBus = ({ logger }) => {
  /** @type {Map<string, Set<Function>>} */
  const handlers = new Map();

  const subscribe = (eventType, handler) => {
    if (typeof eventType !== "string" || eventType.trim() === "") {
      throw new Error("EventBus.subscribe: eventType must be a non-empty string");
    }
    if (typeof handler !== "function") {
      throw new Error("EventBus.subscribe: handler must be a function");
    }

    if (!handlers.has(eventType)) {
      handlers.set(eventType, new Set());
    }

    handlers.get(eventType).add(handler);

    logger?.debug({
      msg: "EventBus: handler subscribed",
      eventType,
      handlerCount: handlers.get(eventType).size,
    });

    // Return an unsubscribe function (useful for testing & cleanup)
    return () => handlers.get(eventType)?.delete(handler);
  };

  const publish = async (event) => {
    if (!event || typeof event !== "object") {
      throw new Error("EventBus.publish: event must be a non-null object");
    }
    if (!event.type) {
      throw new Error("EventBus.publish: event.type is required");
    }

    const eventHandlers = handlers.get(event.type);

    if (!eventHandlers || eventHandlers.size === 0) {
      logger?.debug({
        msg: "EventBus: no handlers registered",
        eventType: event.type,
        eventId: event.id,
      });
      return;
    }

    logger?.debug({
      msg: "EventBus: publishing event",
      eventType: event.type,
      eventId: event.id,
      handlerCount: eventHandlers.size,
    });

    // CRITICAL: allSettled — every handler runs, failures are isolated
    const results = await Promise.allSettled(
      [...eventHandlers].map((handler) => handler(event))
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        // Log the failure — do NOT re-throw. The publisher committed already.
        logger?.error({
          msg: "EventBus: handler failed",
          eventType: event.type,
          eventId: event.id,
          handlerIndex: index,
          error: result.reason?.message,
          stack: result.reason?.stack,
        });
      }
    });
  };

  return { publish, subscribe };
};
