import {
  assertFunction,
  assertNonEmptyString,
  assertObject,
} from "../../../../shared/kernel/assertions/index.js";

const streamNameFor = (eventType) => `events:${eventType}`;

const fieldsToObject = (fields = []) => {
  const record = {};
  for (let index = 0; index < fields.length; index += 2) {
    record[fields[index]] = fields[index + 1];
  }
  return record;
};

const normalizeStreamEntries = (reply) => {
  if (!Array.isArray(reply)) return [];

  return reply.flatMap((stream) => {
    const [, entries = []] = stream;
    return entries.map(([id, fields]) => ({ id, fields: fieldsToObject(fields) }));
  });
};

export const createRedisStreamEventBus = ({ redisClient, logger }) => {
  assertObject(
    redisClient,
    "redisClient",
    "RedisStreamEventBus requires a connected ioredis client. " +
      "Check REDIS_URL in your environment."
  );
  assertFunction(redisClient.xadd, "redisClient.xadd", "Redis client must implement .xadd()");
  assertFunction(redisClient.xread, "redisClient.xread", "Redis client must implement .xread()");

  const publish = async (event) => {
    assertObject(event, "event", "EventBus.publish: event must be a non-null object");
    assertNonEmptyString(event.type, "event.type", "EventBus.publish: event.type is required");

    await redisClient.xadd(streamNameFor(event.type), "*", "data", JSON.stringify(event));
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

    const poll = async () => {
      while (active) {
        try {
          const reply = await redisClient.xread("BLOCK", "1000", "STREAMS", stream, lastId);
          for (const entry of normalizeStreamEntries(reply)) {
            lastId = entry.id;
            const event = JSON.parse(entry.fields.data);
            await handler(event);
          }
        } catch (error) {
          logger?.error({
            msg: "RedisEventBus: subscription poll failed",
            eventType,
            error,
          });
        }
      }
    };

    void poll();
    logger?.debug({ msg: "RedisEventBus: handler subscribed", eventType, stream });

    return () => {
      active = false;
    };
  };

  return { publish, subscribe };
};
