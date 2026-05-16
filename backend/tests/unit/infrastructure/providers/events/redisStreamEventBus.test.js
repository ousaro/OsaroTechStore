import test from "node:test";
import assert from "node:assert/strict";

import { createRedisStreamEventBus } from "../../../../../src/infrastructure/providers/events/redis/redisStreamEventBus.js";

test("Redis stream event bus requires a redis client", () => {
  assert.throws(() => createRedisStreamEventBus({ redisClient: null }));
});

test("Redis stream event bus publishes events to a typed stream", async () => {
  const commands = [];
  const bus = createRedisStreamEventBus({
    redisClient: {
      xAdd: async (...parts) => commands.push(parts),
      xRead: async () => null,
    },
    logger: {
      debug: () => {},
      error: () => {},
    },
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

test("Redis stream event bus subscribes with XREAD and dispatches stream events", async () => {
  const logs = [];
  let unsubscribe;
  let reads = 0;
  const handled = [];

  const bus = createRedisStreamEventBus({
    redisClient: {
      xAdd: async () => "1-0",
      xRead: async (...parts) => {
        reads += 1;
        if (reads > 1) return new Promise(() => {});
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

test("Redis stream event bus dead-letters failed handler events", async () => {
  const commands = [];
  const logs = [];
  let unsubscribe;
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
        if (reads > 1) return new Promise(() => {});
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

  unsubscribe = bus.subscribe("PaymentFailed", async () => {
    unsubscribe();
    throw new Error("boom");
  });
  await deadLetteredPromise;
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(commands[0][0], "events:dead-letter");
  assert.equal(JSON.parse(commands[0][2].data).event.id, "evt_2");
  assert.equal(logs[0].msg, "RedisEventBus: handler failed; event moved to dead letter stream");
});
