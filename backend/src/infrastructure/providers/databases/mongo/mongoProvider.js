import mongoose from "mongoose";

import { createMongooseAuthUserRepository } from "../../../../modules/auth/adapters/output/repositories/mongo/mongooseAuthUserRepository.js";
import { createMongooseUserRepository } from "../../../../modules/users/adapters/output/repositories/mongo/mongooseUserRepository.js";
import { createMongooseCategorieRepository } from "../../../../modules/categories/output/adapters/repositories/mongo/mongooseCategoryRepository.js";
import { createMongooseOrderRepository } from "../../../../modules/orders/adapters/output/repositories/mongo/mongooseOrderRepository.js";
import { createMongoosePaymentRepository } from "../../../../modules/payments/adapters/output/repositories/mongo/mongoosePaymentRepository.js";
import { createMongooseProductRepository } from "../../../../modules/products/adapters/output/repositories/mongo/mongooseProductRepository.js";

export const createMongoProvider = ({ uri, options = {} }) => {
  if (!uri) {
    throw new Error("Mongo URI is required");
  }

  let connection = null;

  return {
    async connect() {
      if (!connection) {
        connection = await mongoose.connect(uri, options);
      }
      return connection;
    },

    getClient() {
      if (!connection) {
        throw new Error("MongoDB is not connected yet");
      }
      return connection;
    },

    async disconnect() {
      if (connection) {
        await mongoose.disconnect();
        connection = null;
      }
    },

    getName() {
      return "mongo";
    },

    createRepositories(){
      return {
          authUserRepository: createMongooseAuthUserRepository(this.getClient()),
          userRepository: createMongooseUserRepository(this.getClient()),
          categoryRepository: createMongooseCategorieRepository(this.getClient()),
          orderRepository: createMongooseOrderRepository(this.getClient()), 
          paymentRepository: createMongoosePaymentRepository(this.getClient()),
          productRepository: createMongooseProductRepository(this.getClient()),
      }
    }
  };
};