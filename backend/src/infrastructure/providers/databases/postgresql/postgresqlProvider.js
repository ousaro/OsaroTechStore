import { createAuthUserPostgresRepository } from "../../../modules/auth/adapters/postgres/user.repository.postgresjs";
import { createCategoriesPostgresRepository } from "../../../modules/categories/adapters/postgres/user.repository.postgresjs";
import { createOrdersPostgresRepository } from "../../../modules/orders/adapters/postgres/user.repository.postgresjs";
import { createPaymentsPostgresRepository } from "../../../modules/payments/adapters/postgres/user.repository.postgresjs";
import { createProductsPostgresRepository } from "../../../modules/products/adapters/postgres/user.repository.postgresjs";
import { createUsersPostgresRepository } from "../../../modules/users/adapters/postgres/user.repository.postgresjs";
export const createPostgresProvider = ({ host, user, password, database }) => {
  return {
    async connect() {
      throw new Error("Postgres not implemented yet");
    },

    async disconnect(){

    },

    getClient(){
      return
    },

    getName() {
      return "postgres";
    },

    createRepositories(){
      return {
          authUserRepository: createAuthUserPostgresRepository(this.getClient()),
          userRepository: createUsersPostgresRepository(this.getClient()),
          categoryRepository: createCategoriesPostgresRepository(this.getClient()),
          orderRepository: createOrdersPostgresRepository(this.getClient()), 
          paymentRepository: createPaymentsPostgresRepository(this.getClient()),
          productRepository: createProductsPostgresRepository(this.getClient()),
      }
    }
  };
};