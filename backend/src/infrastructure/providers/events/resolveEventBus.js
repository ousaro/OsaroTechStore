
import { createInProcessEventBus } from "./inProcess/inProcessEventBus.js";
import { createRedisStreamEventBus } from "./redis/redisStreamEventBus.js";
import { ServiceUnavailableError } from "../../../shared/application/errors/index.js";
import { assertEventBusPort } from "../../../shared/application/ports/eventBusPort.js";
import { assertObject } from "../../../shared/kernel/assertions/index.js";

export const resolveEventBus = ({ provider = "inprocess", logger, options = {} } = {}) => {
  switch (provider) {
    case "inprocess":
      return assertEventBusPort(createInProcessEventBus({ logger }), "resolveEventBus");

    case "redis":
      assertObject(options.redisClient, "options.redisClient");
      return assertEventBusPort(
        createRedisStreamEventBus({ redisClient: options.redisClient, logger }),
        "resolveEventBus"
      );

    default:
      throw new ServiceUnavailableError(
        `Unknown event bus provider: "${provider}". ` +
          `Supported: "inprocess", "redis". Check EVENT_BUS_PROVIDER in .env`
      );
  }
};
