import { assertFunction, assertObject } from "../../kernel/assertions/index.js";

interface EventBus {
  publish(event: unknown): void | Promise<void>;
  subscribe(eventType: string, handler: (event: unknown) => void): void;
  getName(): string;
}

export const EVENT_BUS_METHODS: readonly string[] = Object.freeze([
  "publish",
  "subscribe",
  "getName",
]);

export const assertEventBusPort = (eventBus: unknown, context = "unknown"): EventBus => {
  assertObject(eventBus, "eventBus", `[${context}] eventBus port is required`);
  const eb = eventBus as Record<string, unknown>;

  for (const method of EVENT_BUS_METHODS) {
    assertFunction(
      eb[method],
      `eventBus.${method}`,
      `[${context}] eventBus must implement .${method}(). ` +
        "Are you passing the correct event bus adapter?"
    );
  }
  return eb as unknown as EventBus;
};
