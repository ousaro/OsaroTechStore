/**
 * Application Bootstrap.
 *
 * Orchestrates the startup sequence:
 *  1. Configure all modules (wires the full dependency graph)
 *  2. Create the Express app with injected routes
 *  3. Start the HTTP server
 *  4. Start background schedulers
 *  5. Register graceful shutdown handlers
 */

import { createApp } from "./createApp.js";

export const startApplication = async ({ port, env }) => {
  // Wire everything
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
    schedulers,
    shutdown,
  } = await configureApplicationModules({ env });

  // Build Express app with injected dependencies
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
  });

  // Start HTTP server
  const server = app.listen(port, () => {
    logger.info({
      msg: `Server running`,
      port,
      env: process.env.NODE_ENV ?? "development",
    });
  });

  // Start background schedulers (after server is ready)
  for (const scheduler of schedulers) {
    scheduler.start();
    logger.info({ msg: "Scheduler started", name: scheduler.name ?? "unnamed" });
  }

  // Graceful shutdown on SIGTERM/SIGINT (Docker, k8s, Ctrl+C)
  const handleShutdown = async (signal) => {
    logger.info({ msg: `Received ${signal}, shutting down gracefully` });
    server.close(async () => {
      await shutdown();
      process.exit(0);
    });
    // Force exit after 10s if server doesn't close
    setTimeout(() => {
      logger.error({ msg: "Forced shutdown after timeout" });
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));

  return server;
};
