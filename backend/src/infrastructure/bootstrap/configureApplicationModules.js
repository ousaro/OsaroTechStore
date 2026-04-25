// config
import { env } from "../config/env.js";

// module configuration
import { configureAuthModule } from "../../modules/auth/composition.js";
import { configureCategoriesModule } from "../../modules/categories/composition.js";
import { configureOrdersModule } from "../../modules/orders/composition.js";
import { configurePaymentsModule } from "../../modules/payments/composition.js";
import { configureProductsModule } from "../../modules/products/composition.js";
import { configureUsersModule } from "../../modules/users/composition.js";


// Providers resolver
import { resolveDatabaseStrategy } from "../providers/databases/resolveDatabaseProvider.js";
import { resolvePaymentGatewayStrategy } from "../providers/payments/resolvePaymentGateway.js";

export const configureApplicationModules = async ({ eventBus }) => {
  // 1. Infrastructure
  const database = resolveDatabaseStrategy({
    provider: env.databaseProvider,
    connection: env.databaseConnection,
  });

  const payment = resolvePaymentGatewayStrategy({
    provider: env.paymentProvider,
    stripeSecretKey: env.stripeSecretKey,
    stripeWebhookSecret: env.stripeWebhookSecret,
  });

  await database.connect();


  // 2. Repositories
  const {
    authUserRepository,
    userRepository,
    categoryRepository,
    orderRepository, 
    paymentRepository, 
    productRepository 
  } = database.createRepositories();

  // 3. Modules
  const authModule = configureAuthModule({
    authUserRepository
  });

  configureUsersModule({
    userRepository
  });

  const productModule = configureProductsModule({
    productRepository,
  });

  configureCategoriesModule({
    categoryRepository,
    categoryEventPublisher: eventBus,
  });

  configureOrdersModule({
    orderRepository,
    orderEventPublisher: eventBus,
  });

  configurePaymentsModule({
    paymentGateway: payment.gateway,
    paymentRepository,
    paymentEventPublisher: eventBus,
    clientUrl: env.clientUrl,
  });

  return { authModule, productModule }
};