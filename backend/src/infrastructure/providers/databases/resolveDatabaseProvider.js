import { createMongoProvider } from "./mongo/mongoProvider.js";
import { createPostgresProvider } from "./postgres/postgresProvider.js";

export const resolveDatabaseProvider = (config = {}) => {
  const { provider, ...providerConfig } = config;

  const providers = {
    mongo: createMongoProvider,
    postgres: createPostgresProvider,
  };

  const createProvider = providers[provider];

  if (!createProvider) {
    throw new Error(`Database provider "${provider}" not supported`);
  }

  return createProvider(providerConfig);
};