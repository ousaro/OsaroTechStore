/**
 * Express Application Factory.
 *
 * Receives all route factories as parameters — it has ZERO knowledge of
 * modules, repositories, or domain logic. This is the HTTP adapter for
 * the entire application.
 *
 *  - No imports from module public-apis (was creating implicit singleton coupling)
 *  - requireAuth created once here and injected into all routes
 *  - Error and 404 middleware registered correctly at the end
 *  - requestIdMiddleware added for distributed tracing
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { requestIdMiddleware }         from "../shared/infrastructure/http/middleware/requestIdMiddleware.js";
import { createRequireAuthMiddleware } from "../shared/infrastructure/http/middleware/createRequireAuthMiddleware.js";
import { createErrorMiddleware }       from "../shared/infrastructure/http/middleware/errorMiddleware.js";
import { notFoundMiddleware }          from "../shared/infrastructure/http/middleware/notFoundMiddleware.js";

export const createApp = ({
  logger,
  tokenService,
  authRoutes,
  usersRoutes,
  productsRoutes,
  categoriesRoutes,
  ordersRoutes,
  paymentsRoutes,
}) => {
  const app = express();

  // ── Global middleware ────────────────────────────────────────────────────
  app.use(requestIdMiddleware);
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());

  // NOTE: Raw body for Stripe webhook is handled inside paymentsRoutes.
  // Do NOT apply express.json() globally before the webhook route.
  app.use((req, res, next) => {
    if (req.originalUrl === "/api/payments/webhook") {
      return next(); // Raw body handled by the payments router
    }
    return express.json()(req, res, next);
  });

  // ── Auth middleware (shared across all protected routes) ─────────────────
  const requireAuth = createRequireAuthMiddleware({ tokenService });

  // ── Routes ───────────────────────────────────────────────────────────────
  // Route factories receive requireAuth — they decide which routes are protected.
  app.use("/api/auth",       authRoutes({ requireAuth }));
  app.use("/api/users",      usersRoutes({ requireAuth }));
  app.use("/api/products",   productsRoutes({ requireAuth }));
  app.use("/api/categories", categoriesRoutes({ requireAuth }));
  app.use("/api/orders",     ordersRoutes({ requireAuth }));
  app.use("/api/payments",   paymentsRoutes({ requireAuth }));

  // ── Error handling (MUST be last) ────────────────────────────────────────
  app.use(notFoundMiddleware);
  app.use(createErrorMiddleware(logger));

  return app;
};
