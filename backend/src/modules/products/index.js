import { buildGetAllProductsUseCase } from "./application/use-cases/getAllProductsUseCase.js";
import { buildGetProductByIdUseCase } from "./application/use-cases/getProductByIdUseCase.js";
import { buildAddProductUseCase } from "./application/use-cases/addProductUseCase.js";
import { buildUpdateProductUseCase } from "./application/use-cases/updateProductUseCase.js";
import { buildDeleteProductUseCase } from "./application/use-cases/deleteProductUseCase.js";
import { buildRefreshNewProductStatusUseCase } from "./application/use-cases/refreshNewProductStatusUseCase.js";
import { createMongooseProductRepository } from "./infrastructure/repositories/mongooseProductRepository.js";
import { createProductHttpController } from "./infrastructure/http/productHttpController.js";
import { createNewProductStatusScheduler } from "./infrastructure/schedulers/newProductStatusScheduler.js";

const productRepository = createMongooseProductRepository();

const getAllProductsUseCase = buildGetAllProductsUseCase({
  productRepository,
});

const getProductByIdUseCase = buildGetProductByIdUseCase({
  productRepository,
});
const addProductUseCase = buildAddProductUseCase({ productRepository });
const updateProductUseCase = buildUpdateProductUseCase({ productRepository });
const deleteProductUseCase = buildDeleteProductUseCase({ productRepository });
const refreshNewProductStatusUseCase = buildRefreshNewProductStatusUseCase({ productRepository });
const newProductStatusScheduler = createNewProductStatusScheduler({
  refreshNewProductStatusUseCase,
});

export const {
  getAllProductsHandler,
  getProductByIdHandler,
  addProductHandler,
  updateProductHandler,
  deleteProductHandler,
} =
  createProductHttpController({
    getAllProductsUseCase,
    getProductByIdUseCase,
    addProductUseCase,
    updateProductUseCase,
    deleteProductUseCase,
  });

export const startNewProductStatusScheduler = () => newProductStatusScheduler.start();
