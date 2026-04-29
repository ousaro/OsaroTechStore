/**
 * Application Composition Root.
 *
 * This is the ONLY file that knows the full dependency graph.
 * It wires infrastructure → modules and registers cross-module workflows.
 *
 * Architecture rules enforced here:
 *  1. Modules receive dependencies as parameters — they never import infra.
 *  2. All instances are local variables — NO global let singletons.
 *  3. The DB provider exposes a client only — repositories are wired here.
 *  4. Route factories receive injected handlers — createApp knows no modules.
 *  5. Event bus subscriptions (workflows) are registered after all modules are wired.
 *
 * To switch any provider: change env vars. The resolver picks the adapter.
 * No module code ever changes.
 */

import { resolveDatabaseStrategy }   from "../providers/databases/resolveDatabaseStrategy.js";
import { resolvePaymentStrategy }     from "../providers/payments/resolvePaymentStrategy.js";
import { resolveEventBus }            from "../../shared/infrastructure/events/resolveEventBus.js";
import { createConsoleLogger }        from "../providers/logger/consoleLogger.js";
import { createScopedLogger }         from "../../shared/application/ports/loggerPort.js";

// ── Module factories ────────────────────────────────────────────────────────
import { createAuthModule }           from "../../modules/auth/composition.js";
import { createUsersModule }          from "../../modules/users/composition.js";
import { createProductsModule }       from "../../modules/products/composition.js";
import { createCategoriesModule }     from "../../modules/categories/composition.js";
import { createOrdersModule }         from "../../modules/orders/composition.js";
import { createPaymentsModule }       from "../../modules/payments/composition.js";

// ── Repository factories ────────────────────────────────────────────────────
import { createMongooseAuthUserRepository }     from "../../modules/auth/adapters/output/repositories/mongooseAuthUserRepository.js";
import { createMongooseUserRepository }         from "../../modules/users/adapters/output/repositories/mongooseUserRepository.js";
import { createMongooseProductRepository }      from "../../modules/products/adapters/output/repositories/mongooseProductRepository.js";
import { createMongooseCategoryRepository }     from "../../modules/categories/adapters/output/repositories/mongooseCategoryRepository.js";
import { createMongooseOrderRepository }        from "../../modules/orders/adapters/output/repositories/mongo/mongooseOrderRepository.js";
import { createMongoosePaymentRepository }      from "../../modules/payments/adapters/output/repositories/mongoosePaymentRepository.js";

// ── JWT Token Service ───────────────────────────────────────────────────────
import { createJwtTokenService }      from "../../modules/auth/adapters/output/services/jwtTokenService.js";

// ── Cross-module collaboration translators ──────────────────────────────────
import { createOrderPlacedPaymentLinkTranslator }           from "../../modules/payments/adapters/input/collaboration/orderPlacedPaymentLinkTranslator.js";
import { createCategoryDeletedProductCleanupTranslator }    from "../../modules/categories/adapters/input/collaboration/categoryDeletedProductCleanupTranslator.js";
import { createPaymentConfirmedOrderSyncTranslator }        from "../../modules/orders/adapters/input/collaboration/paymentConfirmedOrderSyncTranslator.js";

export const configureApplicationModules = async ({ env }) => {
  // ── 1. Logger ─────────────────────────────────────────────────────────────
  const logger = createConsoleLogger("app");

  // ── 2. Infrastructure providers ───────────────────────────────────────────
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

  const eventBus = resolveEventBus({
    provider: env.eventBusProvider,
    logger: createScopedLogger(logger, "eventBus"),
  });

  // ── 3. Shared services ────────────────────────────────────────────────────
  const tokenService = createJwtTokenService({
    secret: env.tokenSecret,
    expiresIn: env.tokenExpiresIn,
    logger: createScopedLogger(logger, "tokenService"),
  });

  // ── 4. Repositories (composition root wires them — NOT the DB provider) ───
  const authUserRepository  = createMongooseAuthUserRepository({ dbClient });
  const userRepository      = createMongooseUserRepository({ dbClient });
  const productRepository   = createMongooseProductRepository({ dbClient });
  const categoryRepository  = createMongooseCategoryRepository({ dbClient });
  const orderRepository     = createMongooseOrderRepository({ dbClient });
  const paymentRepository   = createMongoosePaymentRepository({ dbClient });

  // ── 5. Modules (each is a pure factory — no singletons, no globals) ───────
  const authModule = createAuthModule({
    authUserRepository,
    tokenService,
    oauthProviders: env.oauthProviders,
    clientUrl: env.clientUrl,
    logger: createScopedLogger(logger, "auth"),
  });

  // TODO: authUserRepository is not used by teh userModule
  const usersModule = createUsersModule({
    userRepository,
    authUserRepository,   // Users delegates credential ops to auth repo
    logger: createScopedLogger(logger, "users"),
  });

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

  const paymentsModule = createPaymentsModule({
    paymentGateway:        paymentStrategy.gateway,
    paymentRepository,
    paymentEventPublisher: eventBus,
    paymentsEnabled:       paymentStrategy.paymentsEnabled,
    webhookEnabled:        paymentStrategy.webhookEnabled,
    clientUrl:             env.clientUrl,
    logger: createScopedLogger(logger, "payments"),
  });

  // ── 6. Cross-module event workflows ──────────────────────────────────────
  // Pattern: subscribe translators to the event bus.
  // Translators are collaboration adapters — they translate events into
  // use case calls on the receiving module.

  // When an Order is placed → Payments links payment record to the order
  const paymentLinkTranslator = createOrderPlacedPaymentLinkTranslator({
    linkPaymentToOrder: paymentsModule.linkPaymentToOrder,
  });
  eventBus.subscribe("OrderPlaced", (event) => paymentLinkTranslator.publish(event));

  // When a Category is deleted → Products removes all products in that category
  const productCleanupTranslator = createCategoryDeletedProductCleanupTranslator({
    removeProductsByCategory: productsModule.removeProductsByCategory,
  });
  eventBus.subscribe("CategoryDeleted", (event) => productCleanupTranslator.publish(event));

  // When a Payment is confirmed → Orders updates order payment status
  const paymentConfirmedTranslator = createPaymentConfirmedOrderSyncTranslator({
    confirmOrderPayment: ordersModule.confirmOrderPayment,
  });
  eventBus.subscribe("PaymentConfirmed", (event) => paymentConfirmedTranslator.publish(event));
  eventBus.subscribe("PaymentFailed",    (event) => paymentConfirmedTranslator.publish(event));
  eventBus.subscribe("PaymentExpired",   (event) => paymentConfirmedTranslator.publish(event));

  logger.info({
    msg: "All modules configured",
    database:  env.databaseProvider,
    payments:  env.paymentProvider,
    eventBus:  env.eventBusProvider,
  });

  // ── 7. Return route handlers to createApp — no module refs escape ─────────
  // createApp receives only the pre-built route factories and shared middleware.
  // It has zero knowledge of modules, use cases, or infrastructure.
  return {
    logger,
    tokenService,
    paymentStrategy,

    // Route factories — each receives its pre-wired handlers
    authRoutes:       authModule.createRoutes,
    usersRoutes:      usersModule.createRoutes,
    productsRoutes:   productsModule.createRoutes,
    categoriesRoutes: categoriesModule.createRoutes,
    ordersRoutes:     ordersModule.createRoutes,
    paymentsRoutes:   paymentsModule.createRoutes,

    // Schedulers — started by startApplication after the HTTP server is up
    schedulers: [
      productsModule.createNewProductStatusScheduler(),
    ],

    // Graceful shutdown
    shutdown: async () => {
      logger.info({ msg: "Shutting down..." });
      await database.disconnect();
    },
  };
};
