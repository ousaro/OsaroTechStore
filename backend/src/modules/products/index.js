import { buildGetAllProductsUseCase } from "./application/use-cases/getAllProductsUseCase.js";
import { buildGetProductByIdUseCase } from "./application/use-cases/getProductByIdUseCase.js";
import { buildAddProductUseCase } from "./application/use-cases/addProductUseCase.js";
import { buildUpdateProductUseCase } from "./application/use-cases/updateProductUseCase.js";
import { buildDeleteProductUseCase } from "./application/use-cases/deleteProductUseCase.js";
import { buildRefreshNewProductStatusUseCase } from "./application/use-cases/refreshNewProductStatusUseCase.js";
import { createMongooseProductRepository } from "./infrastructure/repositories/mongooseProductRepository.js";
import { createProductHttpController } from "./infrastructure/http/productHttpController.js";

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

export const {
  getAllProductsHandler,
  getProductByIdHandler,
  addProductHandler,
  updateProductHandler,
  deleteProductHandler,
  runNewProductStatusRefreshHandler,
} =
  createProductHttpController({
    getAllProductsUseCase,
    getProductByIdUseCase,
    addProductUseCase, updateProductUseCase, deleteProductUseCase, refreshNewProductStatusUseCase,
  });
