import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { env } from "../config/env.js";
import { notFoundMiddleware } from "../shared/infrastructure/http/notFoundMiddleware.js";
import { errorMiddleware } from "../shared/infrastructure/http/errorMiddleware.js";
import authRoutes from "../modules/auth/infrastructure/http/authRoutes.js";
import usersRoutes from "../modules/users/infrastructure/http/usersRoutes.js";
import productsRoutes from "../modules/products/infrastructure/http/productsRoutes.js";
import categoriesRoutes from "../modules/categories/infrastructure/http/categoriesRoutes.js";
import ordersRoutes from "../modules/orders/infrastructure/http/ordersRoutes.js";
import paymentsRoutes from "../modules/payments/infrastructure/http/paymentsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiDocument = YAML.load(path.join(__dirname, "../../docs/openapi.yaml"));

export const createApp = () => {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
  app.use("/api/users", usersRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api", paymentsRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
