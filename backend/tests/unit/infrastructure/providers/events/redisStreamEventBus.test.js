import test from "node:test";
import assert from "node:assert/strict";
import { setImmediate } from "node:timers";

import { createRedisStreamEventBus } from "../../../../../src/infrastructure/providers/events/redis/redisStreamEventBus.js";

const noopLogger = { debug: () => {}, error: () => {} };

const mockRedisClient = (overrides = {}) => ({
  xAdd: async () => "0-0",
  xRead: async () => null,
  duplicate: () => mockRedisClient({ ...overrides, isClone: true }),
  ...overrides,
});

test("Redis stream event bus requires a redis client", () => {
  assert.throws(() => createRedisStreamEventBus({ redisClient: null }));
});

test("Redis stream event bus getName returns redis", () => {
  const bus = createRedisStreamEventBus({
    redisClient: mockRedisClient(),
    logger: noopLogger,
  });

  assert.equal(bus.getName(), "redis");
});

test("publish with null event throws", async () => {
  const bus = createRedisStreamEventBus({
    redisClient: mockRedisClient(),
    logger: noopLogger,
  });

  await assert.rejects(() => bus.publish(null));
});

test("publish with missing event type throws", async () => {
  const bus = createRedisStreamEventBus({
    redisClient: mockRedisClient(),
    logger: noopLogger,
  });

  await assert.rejects(() => bus.publish({ id: "evt_1" }));
});

test("publish sends event data to typed stream", async () => {
  const commands = [];
  const bus = createRedisStreamEventBus({
    redisClient: {
      xAdd: async (...parts) => commands.push(parts),
      xRead: async () => null,
    },
    logger: noopLogger,
  });

  await bus.publish({ id: "evt_1", type: "OrderPlaced", payload: { orderId: "order_1" } });

  assert.deepEqual(commands, [
    [
      "events:OrderPlaced",
      "*",
      {
        data: JSON.stringify({ id: "evt_1", type: "OrderPlaced", payload: { orderId: "order_1" } }),
      },
    ],
  ]);
});

test("subscribe with empty event type throws", () => {
  const bus = createRedisStreamEventBus({
    redisClient: mockRedisClient(),
    logger: noopLogger,
  });

  assert.throws(() => bus.subscribe("", () => {}));
});

test("subscribe with non-function handler throws", () => {
  const bus = createRedisStreamEventBus({
    redisClient: mockRedisClient(),
    logger: noopLogger,
  });

  assert.throws(() => bus.subscribe("OrderPlaced", null));
});

test("subscribe dispatches stream events to handler", async () => {
  const logs = [];
  let unsubscribe;
  let reads = 0;
  const handled = [];

  const bus = createRedisStreamEventBus({
    redisClient: {
      xAdd: async () => "1-0",
      xRead: async (...parts) => {
        reads += 1;
        if (reads > 1) {
          return new Promise(() => {});
        }
        assert.deepEqual(parts, [{ key: "events:OrderPlaced", id: "$" }, { BLOCK: 1000 }]);
        return [
          {
            name: "events:OrderPlaced",
            messages: [
              {
                id: "1-0",
                message: {
                  data: JSON.stringify({
                    id: "evt_1",
                    type: "OrderPlaced",
                    payload: { orderId: "o1" },
                  }),
                },
              },
            ],
          },
        ];
      },
    },
    logger: {
      debug: (entry) => logs.push(entry),
      error: (entry) => logs.push(entry),
    },
  });

  await new Promise((resolve) => {
    unsubscribe = bus.subscribe("OrderPlaced", async (event) => {
      handled.push(event);
      unsubscribe();
      resolve();
    });
  });

  assert.deepEqual(handled, [{ id: "evt_1", type: "OrderPlaced", payload: { orderId: "o1" } }]);
  assert.equal(logs[0].msg, "RedisEventBus: handler subscribed");
});

test("dead-letters events when handler throws", async () => {
  const commands = [];
  const logs = [];
  let reads = 0;
  let deadLettered;
  const deadLetteredPromise = new Promise((resolve) => {
    deadLettered = resolve;
  });

  const bus = createRedisStreamEventBus({
    redisClient: {
      xAdd: async (...parts) => {
        commands.push(parts);
        deadLettered();
        return "2-0";
      },
      xRead: async () => {
        reads += 1;
        if (reads > 1) {
          return new Promise(() => {});
        }
        return [
          {
            name: "events:PaymentFailed",
            messages: [
              {
                id: "1-0",
                message: {
                  data: JSON.stringify({
                    id: "evt_2",
                    type: "PaymentFailed",
                    payload: { orderId: "o1" },
                  }),
                },
              },
            ],
          },
        ];
      },
    },
    logger: {
      debug: () => {},
      error: (entry) => logs.push(entry),
    },
  });

  bus.subscribe("PaymentFailed", async () => {
    throw new Error("boom");
  });
  await deadLetteredPromise;
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(commands[0][0], "events:dead-letter");
  assert.equal(JSON.parse(commands[0][2].data).event.id, "evt_2");
  assert.equal(logs[0].msg, "RedisEventBus: handler failed; event moved to dead letter stream");
});

test("subscription poll logs error when connect fails", async () => {
  const logs = [];
  let connectCalled = false;

  const bus = createRedisStreamEventBus({
    redisClient: {
      xAdd: async () => "0-0",
      xRead: async () => null,
      isOpen: true,
      duplicate: () => ({
        xAdd: async () => "0-0",
        xRead: async () => null,
        isOpen: false,
        connect: async () => {
          connectCalled = true;
          throw new Error("Connection refused");
        },
        destroy: () => {},
      }),
    },
    logger: {
      debug: () => {},
      error: (entry) => logs.push(entry),
    },
  });

  bus.subscribe("OrderPlaced", async () => {});

  while (!connectCalled) {
    await new Promise((r) => setTimeout(r, 10));
  }
  await new Promise((r) => setTimeout(r, 20));
  await new Promise((r) => setTimeout(r, 20));

  assert.ok(logs.some((l) => l.msg === "RedisEventBus: subscription poll failed"));
});

test("unsubscribe returns a function that can be called", () => {
  const bus = createRedisStreamEventBus({
    redisClient: mockRedisClient({
      xAdd: async () => "0-0",
      xRead: async () => null,
      duplicate: () => ({
        xAdd: async () => "0-0",
        xRead: async () => null,
        isOpen: true,
        destroy: () => {},
      }),
    }),
    logger: noopLogger,
  });

  const unsubscribe = bus.subscribe("OrderPlaced", async () => {});
  assert.equal(typeof unsubscribe, "function");
  unsubscribe();
});
