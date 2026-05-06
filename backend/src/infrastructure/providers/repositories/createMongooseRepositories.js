/**
 * Mongoose Repository Factory.
 *
 * Centralizes repository adapter construction for the active Mongo connection.
 * The database provider still owns connection lifecycle; this factory only
 * wires module repository adapters to that connection.
 */
import { createMongooseAuthUserRepository } from "../../../modules/auth/adapters/output/repositories/mongo/mongooseAuthUserRepository.js";
import { createMongooseUserRepository } from "../../../modules/users/adapters/output/repositories/mongo/mongooseUserRepository.js";
import { createMongooseProductRepository } from "../../../modules/products/adapters/output/repositories/mongo/mongooseProductRepository.js";
import { createMongooseCategoryRepository } from "../../../modules/categories/adapters/output/repositories/mongo/mongooseCategoryRepository.js";
import { createMongooseOrderRepository } from "../../../modules/orders/adapters/output/repositories/mongo/mongooseOrderRepository.js";
import { createMongoosePaymentRepository } from "../../../modules/payments/adapters/output/repositories/mongo/mongoosePaymentRepository.js";

export const createMongooseRepositories = ({ dbClient }) => ({
  authUserRepository: createMongooseAuthUserRepository({ dbClient }),
  userRepository: createMongooseUserRepository({ dbClient }),
  productRepository: createMongooseProductRepository({ dbClient }),
  categoryRepository: createMongooseCategoryRepository({ dbClient }),
  orderRepository: createMongooseOrderRepository({ dbClient }),
  paymentRepository: createMongoosePaymentRepository({ dbClient }),
});
