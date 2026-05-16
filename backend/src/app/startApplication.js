import { createApp } from "./createApp.js";

export const startApplication = async ({ port, env }) => {
  const { configureApplicationModules } =
    await import("../infrastructure/bootstrap/configureApplicationModules.js");

  const {
    logger,
    tokenService,
    authUserRepository,
    authRoutes,
    usersRoutes,
    productsRoutes,
    categoriesRoutes,
    ordersRoutes,
    paymentsRoutes,
    healthChecks,
    serviceName,
    version,
    corsAllowedOrigins,
    schedulers,
    shutdown,
  } = await configureApplicationModules({ env });

  const app = createApp({
    logger,
    tokenService,
    authUserRepository,
    authRoutes,
    usersRoutes,
    productsRoutes,
    categoriesRoutes,
    ordersRoutes,
    paymentsRoutes,
    healthChecks,
    serviceName,
    version,
    corsAllowedOrigins,
  });

  const server = app.listen(port, () => {
    logger.info({
      msg: `Server running`,
      port,
      env: process.env.NODE_ENV ?? "development",
    });
  });

  for (const scheduler of schedulers) {
    scheduler.start();
    logger.info({ msg: "Scheduler started", name: scheduler.name ?? "unnamed" });
  }

  const handleShutdown = async (signal) => {
    logger.info({ msg: `Received ${signal}, shutting down gracefully` });
    server.close(async () => {
      await shutdown();
      process.exit(0);
    });
    setTimeout(() => {
      logger.error({ msg: "Forced shutdown after timeout" });
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));

  return server;
};
