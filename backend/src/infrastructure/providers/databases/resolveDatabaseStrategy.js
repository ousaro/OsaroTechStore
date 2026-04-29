/**
 * Database Provider Resolver.
 *
 * Selects the correct database adapter from config.
 * All adapters satisfy the same interface: { connect, disconnect, getConnection }.
 *
 * To add a new DB:
 *   1. Create infrastructure/providers/databases/<name>/<name>Provider.js
 *   2. Add a case here — nothing else changes.
 *
 * CRITICAL FIX: Previously exported as "resolveDatabaseProvider" but imported
 * everywhere as "resolveDatabaseStrategy" — crash on startup. Name is now
 * consistent across all files.
 */

import { createMongoProvider } from "./mongo/mongoProvider.js";
import { ServiceUnavailableError } from "../../../shared/application/errors/index.js";

export const resolveDatabaseStrategy = ({ provider, logger, env }) => {
  switch (provider) {
    case "mongo":
      return createMongoProvider({ uri: env.mongoUri, logger });

    case "postgres":
      // Placeholder — implement createPostgresProvider when needed
      throw new ServiceUnavailableError(
        "PostgreSQL provider is not yet implemented. " +
          "Set DATABASE_PROVIDER=mongo or implement createPostgresProvider."
      );

    default:
      throw new ServiceUnavailableError(
        `Unknown database provider: "${provider}". ` +
          `Supported: "mongo", "postgres". Check DATABASE_PROVIDER in .env`
      );
  }
};
