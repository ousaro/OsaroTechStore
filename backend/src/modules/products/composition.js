import { buildGetAllProductsUseCase } from "./application/queries/getAllProductsUseCase.js";
import { buildGetProductByIdUseCase } from "./application/queries/getProductByIdUseCase.js";
import { buildAddProductUseCase } from "./application/commands/addProductUseCase.js";
import { buildUpdateProductUseCase } from "./application/commands/updateProductUseCase.js";
import { buildDeleteProductUseCase } from "./application/commands/deleteProductUseCase.js";
import { buildRemoveProductsByCategoryUseCase } from "./application/commands/removeProductsByCategoryUseCase.js";
import { buildRefreshNewProductStatusUseCase } from "./application/commands/refreshNewProductStatusUseCase.js";
import { createProductsInputPort } from "./ports/input/productsInputPort.js";
import { createProductHttpController } from "./adapters/input/http/productHttpController.js";
import { createNewProductStatusScheduler } from "./adapters/input/schedulers/newProductStatusScheduler.js";

export const createProductsModule = ({
  productRepository,
  schedulerFactory = createNewProductStatusScheduler,
} = {}) => {
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
  const newProductStatusScheduler = schedulerFactory({
    refreshNewProductStatusUseCase,
  });

  return {
    ...createProductHttpController({
      productsInputPort,
    }),
    removeProductsByCategory: (payload) => removeProductsByCategoryUseCase(payload),
    startNewProductStatusScheduler: () => newProductStatusScheduler.start(),
  };
};

export let getAllProductsHandler;
export let getProductByIdHandler;
export let addProductHandler;
export let updateProductHandler;
export let deleteProductHandler;

let productsModule;

const getConfiguredProductsModule = () => {
  if (!productsModule) {
    throw new Error("Products module has not been configured");
  }

  return productsModule;
};

export const removeProductsByCategory = (...args) =>
  getConfiguredProductsModule().removeProductsByCategory(...args);


class ProductService {
  startProductStatusScheduler() {
    getConfiguredProductsModule().startNewProductStatusScheduler();
  }
}

export const configureProductsModule = (dependencies) => {
  const productService = new ProductService()
  productsModule = createProductsModule(dependencies);
  ({
    getAllProductsHandler,
    getProductByIdHandler,
    addProductHandler,
    updateProductHandler,
    deleteProductHandler,
    productService
  } = productsModule);
};
