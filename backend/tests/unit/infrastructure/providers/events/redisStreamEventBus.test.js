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
      xadd: async (...parts) => commands.push(parts),
      xread: async () => null,
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
      "data",
      JSON.stringify({ id: "evt_1", type: "OrderPlaced", payload: { orderId: "order_1" } }),
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
      xadd: async () => "1-0",
      xread: async (...parts) => {
        reads += 1;
        if (reads > 1) return new Promise(() => {});
        assert.deepEqual(parts, ["BLOCK", "1000", "STREAMS", "events:OrderPlaced", "$"]);
        return [
          [
            "events:OrderPlaced",
            [
              [
                "1-0",
                [
                  "data",
                  JSON.stringify({ id: "evt_1", type: "OrderPlaced", payload: { orderId: "o1" } }),
                ],
              ],
            ],
          ],
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
