/**
 * Event Bus Port — Shared Application Layer.
 *
 * Defines the interface that every event bus adapter must implement.
 * Adapters (in infrastructure/providers/events/):
 *   - InProcessEventBus  (default, dev/monolith)
 *   - RedisStreamEventBus (production, multi-instance)
 *   - RabbitMQEventBus   (enterprise)
 *
 * Switching the bus requires only changing the provider resolution in
 * configureApplicationModules.js — no module code changes.
 */

export const EVENT_BUS_METHODS = Object.freeze(["publish", "subscribe"]);

export const assertEventBusPort = (eventBus, context = "unknown") => {
  if (!eventBus || typeof eventBus !== "object") {
    throw new Error(`[${context}] eventBus port is required`);
  }
  for (const method of EVENT_BUS_METHODS) {
    if (typeof eventBus[method] !== "function") {
      throw new Error(
        `[${context}] eventBus must implement .${method}(). ` +
          `Are you passing the correct event bus adapter?`
      );
    }
  }
  return eventBus;
};
