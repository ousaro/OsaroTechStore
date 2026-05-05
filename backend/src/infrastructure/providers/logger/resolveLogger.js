/**
 * Logger Provider Resolver.
 *
 * Selects the correct logger adapter from config.
 * Add a new logger here without touching any module code.
 *
 */

import { createConsoleLogger } from "./consoleLogger.js";
import { assertLoggerPort } from "../../../shared/application/ports/loggerPort.js";
import { ServiceUnavailableError } from "../../../shared/application/errors/index.js";

export const resolveLogger = ({ provider = "console", scope = "app" } = {}) => {
  switch (provider) {
    case "console":
      return assertLoggerPort(createConsoleLogger(scope), "resolveLogger");

    case "pino":
      // Placeholder — implement createPinoLogger when needed
      throw new ServiceUnavailableError(
        "Pino logger is not yet implemented. " +
          "Set LOGGER_PROVIDER=console or implement createPinoLogger."
      );

    case "noop":
      // Placeholder — implement createNoopLogger when needed
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
