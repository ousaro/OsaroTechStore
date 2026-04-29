/**
 * Event Bus Provider Resolver.
 *
 * Selects the correct EventBus adapter based on config.
 * Add a new bus here without touching any module code.
 *
 * Supported providers:
 *   "inprocess"  — InProcessEventBus (default, dev/monolith)
 *   "redis"      — RedisStreamEventBus (production multi-instance)
 *
 * Usage in configureApplicationModules.js:
 *   const eventBus = resolveEventBus({ provider: env.eventBusProvider, logger });
 */

import { createInProcessEventBus } from "./adapters/inProcessEventBus.js";
import { createRedisStreamEventBus } from "./adapters/redisStreamEventBus.js";
import { ServiceUnavailableError } from "../../application/errors/index.js";

export const resolveEventBus = ({ provider = "inprocess", logger, redisClient } = {}) => {
  switch (provider) {
    case "inprocess":
      return createInProcessEventBus({ logger });

    case "redis":
      return createRedisStreamEventBus({ redisClient, logger });

    default:
      throw new ServiceUnavailableError(
        `Unknown event bus provider: "${provider}". ` +
          `Supported: "inprocess", "redis". Check EVENT_BUS_PROVIDER in .env`
      );
  }
};
