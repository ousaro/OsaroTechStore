import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { env } from "../infrastructure/config/env.js";
import { notFoundMiddleware } from "../shared/infrastructure/http/notFoundMiddleware.js";
import { errorMiddleware } from "../shared/infrastructure/http/errorMiddleware.js";
import { createRequireAuthMiddleware } from "../shared/infrastructure/http/createRequireAuthMiddleware.js";
import { verifyAccessToken } from "../modules/auth/public-api.js";
import authRoutes from "../modules/auth/adapters/http/authRoutes.js";
import { createUsersRoutes } from "../modules/users/adapters/http/usersRoutes.js";
import { createProductsRoutes } from "../modules/products/adapters/http/productsRoutes.js";
import { createCategoriesRoutes } from "../modules/categories/adapters/http/categoriesRoutes.js";
import { createOrdersRoutes } from "../modules/orders/adapters/http/ordersRoutes.js";
import { createPaymentsRoutes } from "../modules/payments/adapters/http/paymentsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiDocument = YAML.load(path.join(__dirname, "../../docs/openapi.yaml"));
const shouldSkipBodyParsing = (req) => req.path === "/api/webhook";

export const createSelectiveBodyParser = (bodyParser) => {
  return (req, res, next) => {
    if (shouldSkipBodyParsing(req)) {
      return next();
    }
    return bodyParser(req, res, next);
  };
};

export const createApp = () => {
  const app = express();
  const jsonBodyParser = express.json({ limit: "50mb" });
  const urlencodedBodyParser = express.urlencoded({ limit: "50mb", extended: true });
  const requireAuth = createRequireAuthMiddleware({ verifyAccessToken });

  app.use(createSelectiveBodyParser(jsonBodyParser));
  app.use(createSelectiveBodyParser(urlencodedBodyParser));
  app.use(cookieParser());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );

  app.use(
    session({
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/api/docs.json", (req, res) => res.status(200).json(openApiDocument));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, { explorer: true }));

  app.use("/api/users/auth", authRoutes);
  app.use("/api/users", createUsersRoutes({ requireAuth }));
  app.use("/api/products", createProductsRoutes({ requireAuth }));
  app.use("/api/categories", createCategoriesRoutes({ requireAuth }));
  app.use("/api/orders", createOrdersRoutes({ requireAuth }));
  app.use("/api", createPaymentsRoutes({ requireAuth }));

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
