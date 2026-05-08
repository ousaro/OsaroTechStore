import {
  assertFunction,
  assertNonEmptyString,
  assertObject,
} from "../../../../shared/kernel/assertions/index.js";

const streamNameFor = (eventType) => `events:${eventType}`;

const normalizeStreamEntries = (reply) => {
  if (!Array.isArray(reply)) return [];

  return reply.flatMap((stream) => {
    const entries = stream.messages ?? [];
    return entries.map((entry) => ({ id: entry.id, fields: entry.message }));
  });
};

const closeSubscriptionClient = async (client) => {
  if (!client) return;
  if (client.isOpen === false) return;

  if (typeof client.destroy === "function") {
    client.destroy();
    return;
  }

  if (typeof client.quit === "function" && client.isOpen) {
    await client.quit();
    return;
  }

  await client.close?.();
};

export const createRedisStreamEventBus = ({ redisClient, logger }) => {
  assertObject(
    redisClient,
    "redisClient",
    "RedisStreamEventBus requires a connected node-redis client. " +
      "Check REDIS_URL in your environment."
  );
  assertFunction(redisClient.xAdd, "redisClient.xAdd", "Redis client must implement .xAdd()");
  assertFunction(redisClient.xRead, "redisClient.xRead", "Redis client must implement .xRead()");

  const getName = () => "redis";

  const publish = async (event) => {
    assertObject(event, "event", "EventBus.publish: event must be a non-null object");
    assertNonEmptyString(event.type, "event.type", "EventBus.publish: event.type is required");

    await redisClient.xAdd(streamNameFor(event.type), "*", { data: JSON.stringify(event) });
    logger?.debug({
      msg: "RedisEventBus: event published",
      eventType: event.type,
      eventId: event.id,
    });
  };

  const subscribe = (eventType, handler) => {
    assertNonEmptyString(
      eventType,
      "eventType",
      "EventBus.subscribe: eventType must be a non-empty string"
    );
    assertFunction(handler, "handler", "EventBus.subscribe: handler must be a function");

    let active = true;
    let lastId = "$";
    const stream = streamNameFor(eventType);
    const subscriptionClient = redisClient.duplicate?.() ?? redisClient;
    let closing = false;

    const closeReader = async () => {
      if (subscriptionClient === redisClient || closing) return;
      closing = true;
      await closeSubscriptionClient(subscriptionClient);
    };

    const poll = async () => {
      try {
        if (active && subscriptionClient !== redisClient && !subscriptionClient.isOpen) {
          await subscriptionClient.connect();
        }
      } catch (error) {
        if (active) {
          logger?.error({
            msg: "RedisEventBus: subscription poll failed",
            eventType,
            error,
          });
        }

        await closeReader();
        return;
      }

      while (active) {
        try {
          const reply = await subscriptionClient.xRead(
            { key: stream, id: lastId },
            { BLOCK: 1000 }
          );
          for (const entry of normalizeStreamEntries(reply)) {
            lastId = entry.id;
            const event = JSON.parse(entry.fields.data);
            await handler(event);
          }
        } catch (error) {
          if (!active) break;

          logger?.error({
            msg: "RedisEventBus: subscription poll failed",
            eventType,
            error,
          });
        }
      }

      await closeReader();
    };

    void poll();
    logger?.debug({ msg: "RedisEventBus: handler subscribed", eventType, stream });

    return () => {
      active = false;
      void closeReader();
    };
  };

  return { publish, subscribe, getName };
};
