/**
 * Event Bus Port — Shared Application Layer.
 *
 * Defines the interface that every event bus adapter must implement.
 *
 */

import { assertFunction, assertObject } from "../../kernel/assertions/index.js";

export const EVENT_BUS_METHODS = Object.freeze(["publish", "subscribe", "getName"]);

export const assertEventBusPort = (eventBus, context = "unknown") => {
  assertObject(eventBus, "eventBus", `[${context}] eventBus port is required`);

  for (const method of EVENT_BUS_METHODS) {
    assertFunction(
      eventBus[method],
      `eventBus.${method}`,
      `[${context}] eventBus must implement .${method}(). ` +
        "Are you passing the correct event bus adapter?"
    );
  }
  return eventBus;
};
