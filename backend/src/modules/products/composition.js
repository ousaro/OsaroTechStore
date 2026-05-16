import { buildAddProductUseCase } from "./application/commands/addProductUseCase.js";
import { buildUpdateProductUseCase } from "./application/commands/updateProductUseCase.js";
import { buildDeleteProductUseCase } from "./application/commands/deleteProductUseCase.js";
import { buildRemoveProductsByCategoryUseCase } from "./application/commands/removeProductsByCategoryUseCase.js";
import { buildDecrementStockUseCase } from "./application/commands/decrementStockUseCase.js";
import { buildNewProductStatusScheduler } from "./application/commands/newProductStatusScheduler.js";
import { buildAddProductReviewUseCase } from "./application/commands/addProductReviewUseCase.js";
import { buildGetAllProductsUseCase } from "./application/queries/getAllProductsUseCase.js";
import { buildGetProductByIdUseCase } from "./application/queries/getProductByIdUseCase.js";

import { createProductsInputPort } from "./ports/input/productsInputPort.js";
import { assertProductRepositoryPort } from "./ports/output/productsOutputPort.js";
import { createProductsHttpController } from "./adapters/input/http/productsHttpController.js";
import { createProductsRoutes } from "./adapters/input/http/productsRoutes.js";

export const createProductsModule = ({ productRepository, logger }) => {
  assertProductRepositoryPort(productRepository);

  const addProduct = buildAddProductUseCase({ productRepository, logger });
  const updateProduct = buildUpdateProductUseCase({ productRepository });
  const deleteProduct = buildDeleteProductUseCase({ productRepository });
  const removeProductsByCategory = buildRemoveProductsByCategoryUseCase({
    productRepository,
    logger,
  });
  const decrementStock = buildDecrementStockUseCase({ productRepository, logger });
  const addProductReview = buildAddProductReviewUseCase({ productRepository });
  const getAllProducts = buildGetAllProductsUseCase({ productRepository });
  const getProductById = buildGetProductByIdUseCase({ productRepository });

  const productsInputPort = createProductsInputPort({
    addProduct,
    updateProduct,
    deleteProduct,
    removeProductsByCategory,
    addProductReview,
    getAllProducts,
    getProductById,
  });

  const controller = createProductsHttpController({ productsInputPort });
  const createRoutes = ({ requireAuth } = {}) => createProductsRoutes({ controller, requireAuth });

  const createNewProductStatusScheduler = () =>
    buildNewProductStatusScheduler({ productRepository, logger });

  return {
    createRoutes,
    removeProductsByCategory: productsInputPort.removeProductsByCategory,
    decrementStock,
    createNewProductStatusScheduler,
  };
};
