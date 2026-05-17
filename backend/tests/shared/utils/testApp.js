import { createApp } from "../../../src/app/createApp.js";
import { createScopedLogger } from "../../../src/shared/application/ports/loggerPort.js";
import { createJwtTokenService } from "../../../src/modules/auth/adapters/output/services/jwtTokenService.js";
import { createMongooseRepositories } from "../../../src/infrastructure/providers/repositories/createMongooseRepositories.js";
import { createInProcessEventBus } from "../../../src/infrastructure/providers/events/inProcess/inProcessEventBus.js";
import { createAuthModule } from "../../../src/modules/auth/composition.js";
import { createUsersModule } from "../../../src/modules/users/composition.js";
import { createProductsModule } from "../../../src/modules/products/composition.js";
import { createCategoriesModule } from "../../../src/modules/categories/composition.js";
import { createOrdersModule } from "../../../src/modules/orders/composition.js";
import { createPaymentsModule } from "../../../src/modules/payments/composition.js";
import { createOrderPlacedPaymentLinkTranslator } from "../../../src/modules/payments/adapters/input/collaboration/orderPlacedPaymentLinkTranslator.js";
import { createCategoryDeletedProductCleanupTranslator } from "../../../src/modules/categories/adapters/input/collaboration/categoryDeletedProductCleanupTranslator.js";
import { createPaymentConfirmedOrderSyncTranslator } from "../../../src/modules/orders/adapters/input/collaboration/paymentConfirmedOrderSyncTranslator.js";
import { buildTestEnv } from "./testEnvironment.js";
import { noopLogger } from "./noopLogger.js";

export const createTestApplication = ({
  dbClient,
  env: envOverrides = {},
  paymentGateway,
} = {}) => {
  const env = buildTestEnv(envOverrides);
  const logger = noopLogger;
  const eventBus = createInProcessEventBus({ logger: createScopedLogger(logger, "eventBus") });
  const tokenService = createJwtTokenService({
    secret: env.tokenSecret,
    expiresIn: env.tokenExpiresIn,
    logger: createScopedLogger(logger, "tokenService"),
  });

  const repositories = createMongooseRepositories({ dbClient });
  const {
    authUserRepository,
    userRepository,
    productRepository,
    categoryRepository,
    orderRepository,
    paymentRepository,
  } = repositories;

  const authModule = createAuthModule({
    authUserRepository,
    tokenService,
    oauthProviders: env.oauthProviders,
    clientUrl: env.clientUrl,
    logger: createScopedLogger(logger, "auth"),
  });
  const usersModule = createUsersModule({ userRepository });
  const productsModule = createProductsModule({
    productRepository,
    logger: createScopedLogger(logger, "products"),
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

  const paymentsEnabled = Boolean(paymentGateway);
  const paymentsModule = createPaymentsModule({
    paymentGateway: paymentGateway ?? null,
    paymentRepository,
    paymentEventPublisher: eventBus,
    paymentsEnabled,
    webhookEnabled: paymentsEnabled,
    clientUrl: env.clientUrl,
    logger: createScopedLogger(logger, "payments"),
  });

  const paymentLinkTranslator = createOrderPlacedPaymentLinkTranslator({
    linkPaymentToOrder: paymentsModule.linkPaymentToOrder,
  });
  eventBus.subscribe("OrderPlaced", (event) => paymentLinkTranslator.publish(event));

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

  const app = createApp({
    logger,
    tokenService,
    authUserRepository,
    authRoutes: authModule.createRoutes,
    usersRoutes: usersModule.createRoutes,
    productsRoutes: productsModule.createRoutes,
    categoriesRoutes: categoriesModule.createRoutes,
    ordersRoutes: ordersModule.createRoutes,
    paymentsRoutes: paymentsModule.createRoutes,
    healthChecks: [
      {
        name: "database",
        check: async () => ({ provider: env.databaseProvider }),
      },
      {
        name: "payments",
        check: async () => ({ enabled: paymentsEnabled }),
      },
      {
        name: "eventBus",
        check: async () => ({ provider: env.eventBusProvider }),
      },
    ],
    serviceName: env.serviceName,
    version: env.appVersion,
    corsAllowedOrigins: env.corsAllowedOrigins,
    clientUrl: env.clientUrl,
    sessionSecret: env.sessionSecret,
    nodeEnv: env.nodeEnv,
  });

  return {
    app,
    env,
    eventBus,
    tokenService,
    repositories,
  };
};
