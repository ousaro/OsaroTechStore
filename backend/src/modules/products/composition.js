/**
 * Products Module Composition.
 *
 * Fixed from original:
 *  - productService singleton was a no-op bug (new ProductService() was
 *    overwritten to undefined by destructuring). Removed entirely.
 *  - Scheduler is now a proper use case builder, not a side-effect.
 *  - removeProductsByCategory exposed for CategoryDeleted translator.
 *  - No module-level let singletons.
 */
import {
  buildAddProductUseCase,
  buildUpdateProductUseCase,
  buildDeleteProductUseCase,
  buildRemoveProductsByCategoryUseCase,
  buildGetAllProductsUseCase,
  buildGetProductByIdUseCase,
  buildNewProductStatusScheduler,
} from "./application/useCases.js";

import { createProductsHttpController } from "./adapters/input/http/productsHttpController.js";
import { createProductsRoutes }         from "./adapters/input/http/productsRoutes.js";

export const createProductsModule = ({ productRepository, logger }) => {
  const addProduct               = buildAddProductUseCase({ productRepository, logger });
  const updateProduct            = buildUpdateProductUseCase({ productRepository });
  const deleteProduct            = buildDeleteProductUseCase({ productRepository });
  const removeProductsByCategory = buildRemoveProductsByCategoryUseCase({ productRepository, logger });
  const getAllProducts            = buildGetAllProductsUseCase({ productRepository });
  const getProductById           = buildGetProductByIdUseCase({ productRepository });

  const commandPort = { addProduct, updateProduct, deleteProduct, removeProductsByCategory };
  const queryPort   = { getAllProducts, getProductById };

  const controller  = createProductsHttpController({ commandPort, queryPort });
  const createRoutes = ({ requireAuth } = {}) =>
    createProductsRoutes({ controller, requireAuth });

  const createNewProductStatusScheduler = () =>
    buildNewProductStatusScheduler({ productRepository, logger });

  return {
    createRoutes,
    removeProductsByCategory,   // consumed by categoryDeletedProductCleanupTranslator
    createNewProductStatusScheduler,
  };
};
