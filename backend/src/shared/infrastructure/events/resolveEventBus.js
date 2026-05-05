/**
 * Event Bus Provider Resolver.
 *
 * Selects the correct EventBus adapter based on config.
 * Add a new bus here without touching any module code.
 *
 */

import { createInProcessEventBus } from "./adapters/inProcessEventBus.js";
import { createRedisStreamEventBus } from "./adapters/redisStreamEventBus.js";
import { ServiceUnavailableError } from "../../application/errors/index.js";
import { assertEventBusPort } from "../../application/ports/eventBusPort.js";

export const resolveEventBus = ({ provider = "inprocess", logger, redisClient } = {}) => {
  switch (provider) {

    case "inprocess":
      return assertEventBusPort(createInProcessEventBus({ logger }), "resolveEventBus");

    case "redis":
      return assertEventBusPort(createRedisStreamEventBus({ redisClient, logger }), "resolveEventBus");

    default:
      throw new ServiceUnavailableError(
        `Unknown event bus provider: "${provider}". ` +
          `Supported: "inprocess", "redis". Check EVENT_BUS_PROVIDER in .env`
      );
  }
};
