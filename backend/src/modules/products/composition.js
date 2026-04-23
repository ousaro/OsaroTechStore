import { buildGetAllProductsUseCase } from "./application/queries/getAllProductsUseCase.js";
import { buildGetProductByIdUseCase } from "./application/queries/getProductByIdUseCase.js";
import { buildAddProductUseCase } from "./application/commands/addProductUseCase.js";
import { buildUpdateProductUseCase } from "./application/commands/updateProductUseCase.js";
import { buildDeleteProductUseCase } from "./application/commands/deleteProductUseCase.js";
import { buildRemoveProductsByCategoryUseCase } from "./application/commands/removeProductsByCategoryUseCase.js";
import { buildRefreshNewProductStatusUseCase } from "./application/commands/refreshNewProductStatusUseCase.js";
import { createProductsInputPort } from "./ports/input/productsInputPort.js";
import { createMongooseProductRepository } from "./adapters/repositories/mongooseProductRepository.js";
import { createProductHttpController } from "./adapters/http/productHttpController.js";
import { createNewProductStatusScheduler } from "./adapters/schedulers/newProductStatusScheduler.js";

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
const removeProductsByCategoryUseCase = buildRemoveProductsByCategoryUseCase({ productRepository });
const refreshNewProductStatusUseCase = buildRefreshNewProductStatusUseCase({ productRepository });
const productsInputPort = createProductsInputPort({
  getAllProducts: getAllProductsUseCase,
  getProductById: getProductByIdUseCase,
  addProduct: addProductUseCase,
  updateProduct: updateProductUseCase,
  deleteProduct: deleteProductUseCase,
});
const newProductStatusScheduler = createNewProductStatusScheduler({
  refreshNewProductStatusUseCase,
});

export const {
  getAllProductsHandler,
  getProductByIdHandler,
  addProductHandler,
  updateProductHandler,
  deleteProductHandler,
} = createProductHttpController({
  productsInputPort,
});

export const removeProductsByCategory = (payload) => removeProductsByCategoryUseCase(payload);
export const startNewProductStatusScheduler = () => newProductStatusScheduler.start();
