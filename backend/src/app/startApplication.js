import { createApp } from "./createApp.js";
import { registerApplicationWorkflows } from "./registerApplicationWorkflows.js";
import { startNewProductStatusScheduler } from "../modules/products/app-api.js";
import { connectMongo } from "../shared/infrastructure/persistence/connectMongo.js";

export const startApplication = async ({
  mongoUri,
  port,
  connectDatabase = connectMongo,
  createHttpApp = createApp,
  registerWorkflows = registerApplicationWorkflows,
  startRuntimeHooks = startNewProductStatusScheduler,
  logger = console,
}) => {
  await connectDatabase(mongoUri);
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
