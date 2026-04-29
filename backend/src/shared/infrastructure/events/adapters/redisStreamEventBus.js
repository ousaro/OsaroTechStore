/**
 * Redis Streams Event Bus Adapter (stub).
 *
 * This adapter satisfies the same EventBus port as InProcessEventBus.
 * No module code changes when you switch — only resolveEventBus.js changes.
 *
 * To enable:
 *  1. npm install ioredis
 *  2. Set EVENT_BUS_PROVIDER=redis in .env
 *  3. Set REDIS_URL=redis://localhost:6379
 *
 * Production considerations:
 *  - Consumer groups for at-least-once delivery
 *  - Dead-letter stream for failed handlers
 *  - Event ID deduplication via processedWebhookEventIds pattern
 */

export const createRedisStreamEventBus = ({ redisClient, logger }) => {
  if (!redisClient) {
    throw new Error(
      "RedisStreamEventBus requires a connected ioredis client. " +
        "Check REDIS_URL in your environment."
    );
  }

  // Stubbed — implement with ioredis XADD/XREADGROUP when needed
  const publish = async (event) => {
    logger?.info({
      msg: "RedisEventBus: publishing (stub — not yet implemented)",
      eventType: event.type,
      eventId: event.id,
    });
    // Real implementation: await redisClient.xadd(event.type, "*", "data", JSON.stringify(event));
  };

  const subscribe = (_eventType, _handler) => {
    logger?.warn({
      msg: "RedisEventBus: subscribe() not yet implemented",
    });
    return () => {};
  };

  return { publish, subscribe };
};
