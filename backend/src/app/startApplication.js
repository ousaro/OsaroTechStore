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
  // Step 1 — Wire everything (DB connect happens inside here)
  const { configureApplicationModules } = await import(
    "../infrastructure/bootstrap/configureApplicationModules.js"
  );

  const {
    logger,
    tokenService,
    paymentStrategy,
    authRoutes,
    usersRoutes,
    productsRoutes,
    categoriesRoutes,
    ordersRoutes,
    paymentsRoutes,
    schedulers,
    shutdown,
  } = await configureApplicationModules({ env });

  // Step 2 — Build Express app with injected dependencies
  // TODO: the paymentStrategy is not used in the createApp
  const app = createApp({
    logger,
    tokenService,
    paymentStrategy,
    authRoutes,
    usersRoutes,
    productsRoutes,
    categoriesRoutes,
    ordersRoutes,
    paymentsRoutes,
  });

  // Step 3 — Start HTTP server
  const server = app.listen(port, () => {
    logger.info({
      msg: `Server running`,
      port,
      env: process.env.NODE_ENV ?? "development",
    });
  });

  // Step 4 — Start background schedulers (after server is ready)
  for (const scheduler of schedulers) {
    scheduler.start();
    logger.info({ msg: "Scheduler started", name: scheduler.name ?? "unnamed" });
  }

  // Step 5 — Graceful shutdown on SIGTERM/SIGINT (Docker, k8s, Ctrl+C)
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
  process.on("SIGINT",  () => handleShutdown("SIGINT"));

  return server;
};
