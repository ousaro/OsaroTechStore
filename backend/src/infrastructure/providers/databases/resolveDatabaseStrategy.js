import { createMongoProvider } from "./mongo/mongoProvider.js";
import { ServiceUnavailableError } from "../../../shared/application/errors/index.js";
import { assertDatabaseProviderPort } from "../../../shared/application/ports/databaseProviderPort.js";

export const resolveDatabaseStrategy = ({ provider, logger, env }) => {
  switch (provider) {
    case "mongo":
      return assertDatabaseProviderPort(
        createMongoProvider({
          uri: env.mongoUri,
          logger,
          minPoolSize: env.mongoMinPoolSize,
          maxPoolSize: env.mongoMaxPoolSize,
          debug: env.mongoDebug,
          slowOpThresholdMs: env.mongoSlowOpThresholdMs,
        }),
        "resolveDatabaseStrategy"
      );

    default:
      throw new ServiceUnavailableError(
        `Unknown database provider: "${provider}". ` +
          `Supported: "mongo". Check DATABASE_PROVIDER in .env`
      );
  }
};
