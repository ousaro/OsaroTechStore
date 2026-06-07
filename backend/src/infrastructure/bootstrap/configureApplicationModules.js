import { resolveDatabaseStrategy } from "../providers/databases/resolveDatabaseStrategy.js";
import { resolvePaymentStrategy } from "../providers/payments/resolvePaymentStrategy.js";
import { resolveLogger } from "../providers/logger/resolveLogger.js";
import { resolveEventBus } from "../providers/events/resolveEventBus.js";
import { createRedisClient } from "../providers/events/redis/redisClient.js";
import { createScopedLogger } from "../../shared/application/ports/loggerPort.js";
import { createAuditLogger } from "../../shared/infrastructure/audit/createAuditLogger.js";
import { seedAdminUser } from "../seed/seedAdminUser.js";

import { createAuthModule } from "../../modules/auth/composition.js";
import { createUsersModule } from "../../modules/users/composition.js";
import { createProductsModule } from "../../modules/products/composition.js";
import { createCategoriesModule } from "../../modules/categories/composition.js";
import { createOrdersModule } from "../../modules/orders/composition.js";
import { createPaymentsModule } from "../../modules/payments/composition.js";

import { createMongooseRepositories } from "../providers/repositories/createMongooseRepositories.js";

import { createJwtTokenService } from "../../modules/auth/adapters/output/services/jwtTokenService.js";
import { createMongoIdempotencyStore } from "../../shared/infrastructure/persistence/idempotencyStore.js";

import { createOrderPlacedPaymentLinkTranslator } from "../../modules/payments/adapters/input/collaboration/orderPlacedPaymentLinkTranslator.js";
import { createOrderPlacedStockTranslator } from "../../modules/products/adapters/input/collaboration/orderPlacedStockTranslator.js";
import { createCategoryDeletedProductCleanupTranslator } from "../../modules/categories/adapters/input/collaboration/categoryDeletedProductCleanupTranslator.js";
import { createPaymentConfirmedOrderSyncTranslator } from "../../modules/orders/adapters/input/collaboration/paymentConfirmedOrderSyncTranslator.js";

export const configureApplicationModules = async ({ env }) => {
  const logger = resolveLogger({
    provider: env.loggerProvider,
    scope: "app",
    options: {
      colorize: !env.no_color,
      timestampFormat: env.loggerTimestampFormat,
      timestampEnabled: env.loggerTimestampEnabled,
    },
  });

  const database = resolveDatabaseStrategy({
    provider: env.databaseProvider,
    logger: createScopedLogger(logger, "database"),
    env,
  });

  await database.connect();

  const dbClient = database.getConnection();

  const paymentStrategy = resolvePaymentStrategy({
    provider: env.paymentProvider,
    env,
    logger: createScopedLogger(logger, "payments"),
  });

  const redisClient =
    env.eventBusProvider === "redis"
      ? createRedisClient({
          url: env.redisUrl,
          logger: createScopedLogger(logger, "redis"),
        })
      : null;

  if (redisClient) {
    await redisClient.connect();
  }

  const eventBus = resolveEventBus({
    provider: env.eventBusProvider,
    logger: createScopedLogger(logger, "eventBus"),
    options: { redisClient },
  });

  const tokenService = createJwtTokenService({
    secret: env.tokenSecret,
    expiresIn: env.tokenExpiresIn,
    logger: createScopedLogger(logger, "tokenService"),
  });

  const {
    authUserRepository,
    userRepository,
    productRepository,
    categoryRepository,
    orderRepository,
    paymentRepository,
  } = createMongooseRepositories({ dbClient, cache: redisClient });

  await seedAdminUser({ authUserRepository, env, logger: createScopedLogger(logger, "seed") });

  const authModule = createAuthModule({
    authUserRepository,
    tokenService,
    oauthProviders: env.oauthProviders,
    clientUrl: env.clientUrl,
    logger: createScopedLogger(logger, "auth"),
  });

  const usersModule = createUsersModule({
    userRepository,
  });

  const auditLogger = createAuditLogger({ dbClient });

  const productsModule = createProductsModule({
    productRepository,
    logger: createScopedLogger(logger, "products"),
    auditLogger,
  });

  const categoriesModule = createCategoriesModule({
    categoryRepository,
    categoryEventPublisher: eventBus,
    logger: createScopedLogger(logger, "categories"),
  });

  const ordersModule = createOrdersModule({
    orderRepository,
    orderEventPublisher: eventBus,
    logger: createScopedLogger(logger, "orders"),
  });

  const idempotencyStore = createMongoIdempotencyStore(dbClient);

  const paymentsModule = createPaymentsModule({
    paymentGateway: paymentStrategy.gateway,
    paymentRepository,
    paymentEventPublisher: eventBus,
    paymentsEnabled: paymentStrategy.paymentsEnabled,
    webhookEnabled: paymentStrategy.webhookEnabled,
    clientUrl: env.clientUrl,
    logger: createScopedLogger(logger, "payments"),
    idempotencyStore,
  });

  const paymentLinkTranslator = createOrderPlacedPaymentLinkTranslator({
    linkPaymentToOrder: paymentsModule.linkPaymentToOrder,
  });
  eventBus.subscribe("OrderPlaced", (event) => paymentLinkTranslator.publish(event));

  const stockTranslator = createOrderPlacedStockTranslator({
    decrementStock: productsModule.decrementStock,
  });
  eventBus.subscribe("OrderPlaced", (event) => stockTranslator.publish(event));

  const productCleanupTranslator = createCategoryDeletedProductCleanupTranslator({
    removeProductsByCategory: productsModule.removeProductsByCategory,
  });
  eventBus.subscribe("CategoryDeleted", (event) => productCleanupTranslator.publish(event));

  const paymentConfirmedTranslator = createPaymentConfirmedOrderSyncTranslator({
    confirmOrderPayment: ordersModule.confirmOrderPayment,
  });
  eventBus.subscribe("PaymentConfirmed", (event) => paymentConfirmedTranslator.publish(event));
  eventBus.subscribe("PaymentFailed", (event) => paymentConfirmedTranslator.publish(event));
  eventBus.subscribe("PaymentExpired", (event) => paymentConfirmedTranslator.publish(event));

  logger.info({
    msg: "All modules configured",
    database: env.databaseProvider,
    payments: env.paymentProvider,
    eventBus: env.eventBusProvider,
  });

  const healthChecks = [
    {
      name: "database",
      check: async () => {
        database.getConnection();
        return { provider: env.databaseProvider };
      },
    },
    {
      name: "payments",
      check: async () => ({
        provider: paymentStrategy.provider,
        enabled: paymentStrategy.paymentsEnabled,
        webhookEnabled: paymentStrategy.webhookEnabled,
      }),
    },
    {
      name: "eventBus",
      check: async () => {
        if (redisClient) {
          await redisClient.ping();
        }
        return { provider: env.eventBusProvider };
      },
    },
  ];

  return {
    logger,
    tokenService,
    authUserRepository,

    authRoutes: authModule.createRoutes,
    usersRoutes: usersModule.createRoutes,
    productsRoutes: productsModule.createRoutes,
    categoriesRoutes: categoriesModule.createRoutes,
    ordersRoutes: ordersModule.createRoutes,
    paymentsRoutes: paymentsModule.createRoutes,
    healthChecks,
    serviceName: env.serviceName,
    version: env.appVersion,
    corsAllowedOrigins: env.corsAllowedOrigins,
    clientUrl: env.clientUrl,
    sessionSecret: env.sessionSecret,
    nodeEnv: env.nodeEnv,

    schedulers: [productsModule.createNewProductStatusScheduler()],

    shutdown: async () => {
      logger.info({ msg: "Shutting down..." });
      await redisClient?.close();
      await database.disconnect();
    },
  };
};
