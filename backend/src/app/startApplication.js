import { createApp } from "./createApp.js";
import { registerApplicationWorkflows } from "./registerApplicationWorkflows.js";
import { startProductStatusScheduler } from "../infrastructure/runtime/schedulers/startProductStatusScheduler.js";
import { configureApplicationModules } from "../infrastructure/bootstrap/configureApplicationModules.js";
import { applicationEventBus } from "./applicationEventBus.js";

export const startApplication = async ({
  port,
  eventBus = applicationEventBus,
  configureModules = configureApplicationModules,
  createHttpApp = createApp,
  registerWorkflows = registerApplicationWorkflows,
  startRuntimeHooks = startProductStatusScheduler,
  logger = console,
}) => {

  const { auth, product } = configureModules({
    eventBus
  });

  registerWorkflows({
    eventBus
  });

  const { tokenService } = auth
  const { productService } = product

  const app = createHttpApp({ tokenService });
  startRuntimeHooks({ productService });

  return new Promise((resolve) => {
    let server;
    server = app.listen(port, () => {
      logger.log(`API listening on port ${port}`);
      logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
      queueMicrotask(() => resolve(server)); // using queueMicrotask to ensure the server is fully started before resolving the promise
    });
  });
};
