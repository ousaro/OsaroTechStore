import { createConsoleLogger } from "./consoleLogger.js";
import { assertLoggerPort } from "../../../shared/application/ports/loggerPort.js";
import { ServiceUnavailableError } from "../../../shared/application/errors/index.js";

export const resolveLogger = ({ provider = "console", scope = "app", options = {} } = {}) => {
  switch (provider) {
    case "console":
      return assertLoggerPort(createConsoleLogger(scope, options), "resolveLogger");

    case "json":
      return assertLoggerPort(
        createConsoleLogger(scope, { ...options, colorize: false, outputFormat: "json" }),
        "resolveLogger"
      );

    case "noop":
      throw new ServiceUnavailableError(
        "Noop logger is not yet implemented. " +
          "Set LOGGER_PROVIDER=console or implement createNoopLogger."
      );

    default:
      throw new ServiceUnavailableError(
        `Unknown logger provider: "${provider}". ` +
          `Supported: "console", "pino", "noop". Check LOGGER_PROVIDER in .env`
      );
  }
};
