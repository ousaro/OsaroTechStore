import { createApp } from "./createApp.js";
import { registerApplicationWorkflows } from "./registerApplicationWorkflows.js";
import { startNewProductStatusScheduler } from "../modules/products/app-api.js";
import { connectMongo } from "../shared/infrastructure/persistence/connectMongo.js";
import { configureApplicationModules } from "../infrastructure/bootstrap/configureApplicationModules.js";
import { applicationEventBus } from "./applicationEventBus.js";

export const startApplication = async ({
  mongoUri,
  port,
  databaseStrategy = null,
  connectDatabase = connectMongo,
  configureModules = configureApplicationModules,
  createHttpApp = createApp,
  registerWorkflows = registerApplicationWorkflows,
  startRuntimeHooks = startNewProductStatusScheduler,
  logger = console,
}) => {
  if (databaseStrategy) {
    await databaseStrategy.connect();
  } else {
    await connectDatabase(mongoUri);
  }

  configureModules({
    eventBus: applicationEventBus,
    ...(databaseStrategy ? { databaseStrategy } : {}),
  });
  registerWorkflows();

  const app = createHttpApp();
  startRuntimeHooks();

  return new Promise((resolve) => {
    let server;
    server = app.listen(port, () => {
      logger.log(`API listening on port ${port}`);
      logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
      queueMicrotask(() => resolve(server));
    });
  });
};
