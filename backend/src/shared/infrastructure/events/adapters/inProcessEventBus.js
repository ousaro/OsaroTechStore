/**
 * In-Process Event Bus Adapter.
 *
 * Implements the EventBus port for single-process deployments (monolith, dev).
 *
 * To switch to Redis Streams or RabbitMQ:
 *   Replace this file's factory in infrastructure/providers/events/resolveEventBus.js.
 *   All module code stays the same — they only know the port interface.
 */

import {
  assertFunction,
  assertNonEmptyString,
  assertObject,
} from "../../../kernel/assertions/index.js";

export const createInProcessEventBus = ({ logger }) => {
  /** @type {Map<string, Set<Function>>} */
  const handlers = new Map();

  const subscribe = (eventType, handler) => {
    assertNonEmptyString(
      eventType,
      "eventType",
      "EventBus.subscribe: eventType must be a non-empty string"
    );
    assertFunction(handler, "handler", "EventBus.subscribe: handler must be a function");

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
    assertObject(event, "event", "EventBus.publish: event must be a non-null object");
    assertNonEmptyString(event.type, "event.type", "EventBus.publish: event.type is required");

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
