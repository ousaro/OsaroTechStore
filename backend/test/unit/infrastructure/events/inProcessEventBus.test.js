import test from "node:test";
import assert from "node:assert/strict";

import { createInProcessEventBus } from "../../../../src/infrastructure/providers/events/inProcess/inProcessEventBus.js";

const createLogger = () => {
  const entries = [];
  return {
    entries,
    debug: (entry) => entries.push(entry),
    error: (entry) => entries.push(entry),
  };
};

test("in-process event bus publishes events to subscribed handlers", async () => {
  const logger = createLogger();
  const bus = createInProcessEventBus({ logger });
  const received = [];

  bus.subscribe("OrderPlaced", async (event) => received.push(event.payload.orderId));
  await bus.publish({ id: "evt1", type: "OrderPlaced", payload: { orderId: "o1" } });

  assert.deepEqual(received, ["o1"]);
});

test("in-process event bus unsubscribe removes handler", async () => {
  const bus = createInProcessEventBus({ logger: createLogger() });
  let count = 0;
  const unsubscribe = bus.subscribe("OrderPlaced", () => {
    count += 1;
  });

  unsubscribe();
  await bus.publish({ id: "evt1", type: "OrderPlaced", payload: {} });

  assert.equal(count, 0);
});

test("in-process event bus isolates handler failures and logs them", async () => {
  const logger = createLogger();
  const bus = createInProcessEventBus({ logger });
  let successfulHandlerRan = false;

  bus.subscribe("OrderPlaced", async () => {
    throw new Error("handler failed");
  });
  bus.subscribe("OrderPlaced", async () => {
    successfulHandlerRan = true;
  });

  await bus.publish({ id: "evt1", type: "OrderPlaced", payload: {} });

  assert.equal(successfulHandlerRan, true);
  assert.equal(logger.entries.some((entry) => entry.msg === "EventBus: handler failed"), true);
});

test("in-process event bus validates subscribe and publish inputs", async () => {
  const bus = createInProcessEventBus({ logger: createLogger() });

  assert.throws(() => bus.subscribe("", () => {}));
  assert.throws(() => bus.subscribe("OrderPlaced", "not-a-function"));
  await assert.rejects(() => bus.publish({ payload: {} }));
});
