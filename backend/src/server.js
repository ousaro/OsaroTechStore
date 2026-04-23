import { env } from "./infrastructure/config/env.js";
import { startApplication } from "./app/startApplication.js";
import { resolveDatabaseStrategy } from "./infrastructure/providers/databases/databaseStrategies.js";

startApplication({
  port: env.port,
  databaseStrategy: resolveDatabaseStrategy({
    provider: env.databaseProvider,
    connection: env.databaseConnection,
  }),
}).catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
