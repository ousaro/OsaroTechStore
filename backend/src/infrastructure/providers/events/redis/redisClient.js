import { createClient } from "redis";

import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

const attachLogging = (client, logger) => {
  client.on("error", (error) => {
    logger?.error({ msg: "Redis client error", error });
  });
};

export const createRedisClient = ({ url, logger }) => {
  assertNonEmptyString(url, "url", "[Redis] REDIS_URL is required when EVENT_BUS_PROVIDER=redis");

  const redisUrl = new URL(url);
  const client = createClient({ url });
  attachLogging(client, logger);

  const connect = async () => {
    if (!client.isOpen) {
      await client.connect();
    }

    await client.ping();
    logger?.info({
      msg: "Redis connected",
      host: redisUrl.hostname,
      port: Number(redisUrl.port || 6379),
    });
  };

  const close = async () => {
    if (!client.isOpen) return;

    await client.quit();
    logger?.info({ msg: "Redis disconnected" });
  };

  const duplicate = () => {
    const duplicateClient = client.duplicate();
    attachLogging(duplicateClient, logger);
    return duplicateClient;
  };

  return {
    connect,
    close,
    ping: () => client.ping(),
    get: (key) => client.get(key),
    setEx: (key, ttl, value) => client.setEx(key, ttl, value),
    del: (key) => client.del(key),
    xAdd: (...args) => client.xAdd(...args),
    xRead: (...args) => client.xRead(...args),
    duplicate,
  };
};
