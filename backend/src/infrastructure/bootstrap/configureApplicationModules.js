import { env } from "../config/env.js";
import { configureAuthModule } from "../../modules/auth/app-api.js";
import {
  getManagedUserCredentials,
  getManagedUserProfile,
  listManagedUserProfiles,
  removeManagedUserProfile,
  updateManagedUserCredentials,
  updateManagedUserProfile,
} from "../../modules/auth/public-api.js";
import { configureCategoriesModule } from "../../modules/categories/app-api.js";
import { configureOrdersModule } from "../../modules/orders/app-api.js";
import { configurePaymentsModule } from "../../modules/payments/app-api.js";
import { configureProductsModule } from "../../modules/products/app-api.js";
import { configureUsersModule } from "../../modules/users/app-api.js";
import { createJwtTokenService } from "../../modules/auth/adapters/output/services/jwtTokenService.js";
import { resolveDatabaseStrategy } from "../providers/databases/databaseStrategies.js";
import { resolvePaymentGatewayStrategy } from "../providers/payments/paymentGatewayStrategies.js";

export const configureApplicationModules = ({
  eventBus = null,
  databaseStrategy = resolveDatabaseStrategy({
    provider: env.databaseProvider,
    connection: env.databaseConnection,
  }),
  tokenService = createJwtTokenService(),
  paymentStrategy = resolvePaymentGatewayStrategy({
    provider: env.paymentProvider,
    stripeSecretKey: env.stripeSecretKey,
    stripeWebhookSecret: env.stripeWebhookSecret,
  }),
  repositoryBundle = databaseStrategy.createRepositories(),
  authUserRepository = repositoryBundle.authUserRepository,
  categoryRepository = repositoryBundle.categoryRepository,
  orderRepository = repositoryBundle.orderRepository,
  paymentGateway = paymentStrategy.paymentGateway,
  paymentRepository = repositoryBundle.paymentRepository,
  productRepository = repositoryBundle.productRepository,
  userRepositoryFactory = repositoryBundle.userRepositoryFactory,
} = {}) => {
  configureAuthModule({
    authUserRepository,
    tokenService,
  });

  const authUserManagement = {
    getManagedUserCredentials,
    getManagedUserProfile,
    listManagedUserProfiles,
    removeManagedUserProfile,
    updateManagedUserCredentials,
    updateManagedUserProfile,
  };

  configureUsersModule({
    userRepository: userRepositoryFactory({
      authUserManagement,
    }),
  });

  configureProductsModule({
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
    paymentGateway,
    paymentRepository,
    paymentEventPublisher: eventBus,
    clientUrl: env.clientUrl,
  });
};
