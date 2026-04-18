import { buildGetAllProductsUseCase } from "./application/use-cases/getAllProductsUseCase.js";
import { buildGetProductByIdUseCase } from "./application/use-cases/getProductByIdUseCase.js";
import { createMongooseProductRepository } from "./infrastructure/repositories/mongooseProductRepository.js";
import { createProductHttpController } from "./infrastructure/http/productHttpController.js";

const productRepository = createMongooseProductRepository();

const getAllProductsUseCase = buildGetAllProductsUseCase({
  productRepository,
});

const getProductByIdUseCase = buildGetProductByIdUseCase({
  productRepository,
});

export const { getAllProductsHandler, getProductByIdHandler } =
  createProductHttpController({
    getAllProductsUseCase,
    getProductByIdUseCase,
  });
