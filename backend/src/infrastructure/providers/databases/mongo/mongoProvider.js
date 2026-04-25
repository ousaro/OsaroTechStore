import mongoose from "mongoose";

import { createAuthUserMongoRepository } from "../../../modules/auth/adapters/mongo/user.repository.mongo.js";
import { createCategoriesMongoRepository } from "../../../modules/categories/adapters/mongo/user.repository.mongo.js";
import { createOrdersMongoRepository } from "../../../modules/orders/adapters/mongo/user.repository.mongo.js";
import { createPaymentsMongoRepository } from "../../../modules/payments/adapters/mongo/user.repository.mongo.js";
import { createProductsMongoRepository } from "../../../modules/products/adapters/mongo/user.repository.mongo.js";
import { createUsersMongoRepository } from "../../../modules/users/adapters/mongo/user.repository.mongo.js";

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
          authUserRepository: createAuthUserMongoRepository(this.getClient()),
          userRepository: createUsersMongoRepository(this.getClient()),
          categoryRepository: createCategoriesMongoRepository(this.getClient()),
          orderRepository: createOrdersMongoRepository(this.getClient()), 
          paymentRepository: createPaymentsMongoRepository(this.getClient()),
          productRepository: createProductsMongoRepository(this.getClient()),
      }
    }
  };
};