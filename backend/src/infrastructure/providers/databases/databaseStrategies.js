import { createMongooseAuthUserRepository } from "../../../modules/auth/adapters/output/repositories/mongooseAuthUserRepository.js";
import { createMongooseCategoryRepository } from "../../../modules/categories/adapters/output/repositories/mongooseCategoryRepository.js";
import { createMongooseOrderRepository } from "../../../modules/orders/adapters/output/repositories/mongooseOrderRepository.js";
import { createMongoosePaymentRepository } from "../../../modules/payments/adapters/output/repositories/mongoosePaymentRepository.js";
import { createMongooseProductRepository } from "../../../modules/products/adapters/output/repositories/mongooseProductRepository.js";
import { createMongooseUserRepository } from "../../../modules/users/adapters/output/repositories/mongooseUserRepository.js";
import { connectMongo } from "../../../shared/infrastructure/persistence/connectMongo.js";

const DATABASE_LABELS = Object.freeze({
  mongo: "MongoDB",
  postgres: "PostgreSQL",
  h2: "H2",
});

const createMongoRepositoryBundle = () => ({
  authUserRepository: createMongooseAuthUserRepository(),
  categoryRepository: createMongooseCategoryRepository(),
  orderRepository: createMongooseOrderRepository(),
  paymentRepository: createMongoosePaymentRepository(),
  productRepository: createMongooseProductRepository(),
  userRepositoryFactory: createMongooseUserRepository,
});

const createUnsupportedDatabaseStrategy = ({ provider }) => {
  const label = DATABASE_LABELS[provider] || provider;
  const message = `${label} database strategy is not implemented yet`;

  return {
    provider,
    label,
    async connect() {
      throw new Error(message);
    },
    createRepositories() {
      throw new Error(message);
    },
  };
};

export const resolveDatabaseStrategy = ({
  provider = "mongo",
  connection = "",
} = {}) => {
  switch (provider) {
    case "mongo":
      return {
        provider,
        label: DATABASE_LABELS.mongo,
        async connect() {
          if (!connection) {
            throw new Error("MongoDB connection string is required");
          }

          await connectMongo(connection);
        },
        createRepositories: createMongoRepositoryBundle,
      };
    case "postgres":
    case "h2":
      return createUnsupportedDatabaseStrategy({ provider });
    default:
      return createUnsupportedDatabaseStrategy({ provider });
  }
};
