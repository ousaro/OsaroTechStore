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
import { createMongooseAuthUserRepository } from "../../modules/auth/adapters/output/repositories/mongooseAuthUserRepository.js";
import { createJwtTokenService } from "../../modules/auth/adapters/output/services/jwtTokenService.js";
import { createMongooseCategoryRepository } from "../../modules/categories/adapters/output/repositories/mongooseCategoryRepository.js";
import { createMongooseOrderRepository } from "../../modules/orders/adapters/output/repositories/mongooseOrderRepository.js";
import { createStripeGateway } from "../../modules/payments/adapters/output/gateways/stripeGateway.js";
import { createMongoosePaymentRepository } from "../../modules/payments/adapters/output/repositories/mongoosePaymentRepository.js";
import { createMongooseProductRepository } from "../../modules/products/adapters/output/repositories/mongooseProductRepository.js";
import { createMongooseUserRepository } from "../../modules/users/adapters/output/repositories/mongooseUserRepository.js";

export const configureApplicationModules = ({
  eventBus = null,
  authUserRepository = createMongooseAuthUserRepository(),
  tokenService = createJwtTokenService(),
  categoryRepository = createMongooseCategoryRepository(),
  orderRepository = createMongooseOrderRepository(),
  paymentGateway = createStripeGateway({
    secretKey: env.stripeSecretKey,
    webhookSecret: env.stripeWebhookSecret,
  }),
  paymentRepository = createMongoosePaymentRepository(),
  productRepository = createMongooseProductRepository(),
  userRepositoryFactory = createMongooseUserRepository,
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
