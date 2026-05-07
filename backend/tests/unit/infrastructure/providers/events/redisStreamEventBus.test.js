import test from "node:test";
import assert from "node:assert/strict";

import { createRedisStreamEventBus } from "../../../../../src/infrastructure/providers/events/redis/redisStreamEventBus.js";

test("Redis stream event bus requires a redis client", () => {
  assert.throws(() => createRedisStreamEventBus({ redisClient: null }));
});

test("Redis stream event bus stub logs publish and subscribe actions", async () => {
  const logs = [];
  const bus = createRedisStreamEventBus({
    redisClient: {},
    logger: {
      info: (entry) => logs.push(entry),
      warn: (entry) => logs.push(entry),
    },
  });

  await bus.publish({ id: "evt_1", type: "OrderPlaced" });
  const unsubscribe = bus.subscribe("OrderPlaced", () => {});

  assert.equal(typeof unsubscribe, "function");
  assert.deepEqual(logs, [
    {
      msg: "RedisEventBus: publishing (stub — not yet implemented)",
      eventType: "OrderPlaced",
      eventId: "evt_1",
    },
    {
      msg: "RedisEventBus: subscribe() not yet implemented",
    },
  ]);
});
