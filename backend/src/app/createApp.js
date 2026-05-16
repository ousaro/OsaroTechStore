import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import path from "node:path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import promBundle from "express-prom-bundle";

import { requestIdMiddleware } from "../shared/infrastructure/http/middleware/requestIdMiddleware.js";
import { createRequestLoggingMiddleware } from "../shared/infrastructure/http/middleware/requestLoggingMiddleware.js";
import { createRequireAuthMiddleware } from "../shared/infrastructure/http/middleware/createRequireAuthMiddleware.js";
import { createErrorMiddleware } from "../shared/infrastructure/http/middleware/errorMiddleware.js";
import { notFoundMiddleware } from "../shared/infrastructure/http/middleware/notFoundMiddleware.js";
import { registerOpenApiDocs } from "../shared/infrastructure/http/openApiDocs.js";
import { createHealthRoutes } from "../shared/infrastructure/http/healthRoutes.js";

const createCorsOptions = ({ allowedOrigins = [] } = {}) => ({
  credentials: true,
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
});

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
  corsAllowedOrigins = [],
  clientUrl,
  sessionSecret,
  nodeEnv,
}) => {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(requestIdMiddleware);
  app.use(createRequestLoggingMiddleware(logger));
  app.use(cors(createCorsOptions({ allowedOrigins: corsAllowedOrigins })));

  const globalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again later.",
      },
    },
  });
  app.use(globalRateLimit);

  const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    normalizePath: true,
    customLabels: { app: "osarotechstore-backend" },
  });
  app.use(metricsMiddleware);

  app.use(cookieParser());

  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  app.locals.clientUrl = clientUrl;

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: nodeEnv === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req, res, next) => {
    if (
      req.originalUrl === "/api/payments/webhook" ||
      req.originalUrl.startsWith("/api/products/uploads")
    ) {
      return next();
    }
    return express.json({ limit: "1mb" })(req, res, next);
  });

  const requireAuth = createRequireAuthMiddleware({ tokenService, authUserRepository });

  registerOpenApiDocs(app);
  logger.info({
    msg: "Swagger docs enabled",
    docsUrl: "/api-docs",
    specUrl: "/api-docs/openapi.yaml",
  });

  app.use(createHealthRoutes({ healthChecks, serviceName, version }));

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
