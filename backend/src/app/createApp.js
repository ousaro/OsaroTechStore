
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { requestIdMiddleware } from "../shared/infrastructure/http/middleware/requestIdMiddleware.js";
import { createRequestLoggingMiddleware } from "../shared/infrastructure/http/middleware/requestLoggingMiddleware.js";
import { createRequireAuthMiddleware } from "../shared/infrastructure/http/middleware/createRequireAuthMiddleware.js";
import { createErrorMiddleware } from "../shared/infrastructure/http/middleware/errorMiddleware.js";
import { notFoundMiddleware } from "../shared/infrastructure/http/middleware/notFoundMiddleware.js";
import { registerOpenApiDocs } from "../shared/infrastructure/http/openApiDocs.js";
import { createHealthRoutes } from "../shared/infrastructure/http/healthRoutes.js";

export const createApp = ({
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
}) => {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(createRequestLoggingMiddleware(logger));
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());

  app.use((req, res, next) => {
    if (
      req.originalUrl === "/api/payments/webhook" ||
      req.originalUrl.startsWith("/api/products/uploads")
    ) {
      return next();
    }
    return express.json()(req, res, next);
  });

  const requireAuth = createRequireAuthMiddleware({ tokenService, authUserRepository });

  registerOpenApiDocs(app);
  logger.info({
    msg: "Swagger docs enabled",
    docsUrl: "/api-docs",
    specUrl: "/api-docs/openapi.yaml",
  });

  app.use(createHealthRoutes({ healthChecks, serviceName, version }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  app.use("/api/auth", authRoutes({ requireAuth }));
  app.use("/api/users", usersRoutes({ requireAuth }));
  app.use("/api/products", productsRoutes({ requireAuth }));
  app.use("/api/categories", categoriesRoutes({ requireAuth }));
  app.use("/api/orders", ordersRoutes({ requireAuth }));
  app.use("/api/payments", paymentsRoutes({ requireAuth }));

  app.use(notFoundMiddleware);
  app.use(createErrorMiddleware(logger));

  return app;
};
