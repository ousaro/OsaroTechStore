/**
 * Products Module Composition.
 *
 */
import { buildAddProductUseCase } from "./application/commands/addProductUseCase.js";
import { buildUpdateProductUseCase } from "./application/commands/updateProductUseCase.js";
import { buildDeleteProductUseCase } from "./application/commands/deleteProductUseCase.js";
import { buildRemoveProductsByCategoryUseCase } from "./application/commands/removeProductsByCategoryUseCase.js";
import { buildNewProductStatusScheduler } from "./application/commands/newProductStatusScheduler.js";
import { buildGetAllProductsUseCase } from "./application/queries/getAllProductsUseCase.js";
import { buildGetProductByIdUseCase } from "./application/queries/getProductByIdUseCase.js";

import { createProductsInputPort } from "./ports/input/productsInputPort.js";
import { assertProductRepositoryPort } from "./ports/output/productsOutputPort.js";
import { createProductsHttpController } from "./adapters/input/http/productsHttpController.js";
import { createProductsRoutes } from "./adapters/input/http/productsRoutes.js";

export const createProductsModule = ({ productRepository, logger }) => {
  // ── Validate output ports ────────────────────────────────────────────────
  assertProductRepositoryPort(productRepository);

  // ── Use cases ────────────────────────────────────────────────────────────
  const addProduct = buildAddProductUseCase({ productRepository, logger });
  const updateProduct = buildUpdateProductUseCase({ productRepository });
  const deleteProduct = buildDeleteProductUseCase({ productRepository });
  const removeProductsByCategory = buildRemoveProductsByCategoryUseCase({
    productRepository,
    logger,
  });
  const getAllProducts = buildGetAllProductsUseCase({ productRepository });
  const getProductById = buildGetProductByIdUseCase({ productRepository });

  // ── Input port ───────────────────────────────────────────────────────────
  const productsInputPort = createProductsInputPort({
    addProduct,
    updateProduct,
    deleteProduct,
    removeProductsByCategory,
    getAllProducts,
    getProductById,
  });

  // ── HTTP adapter ─────────────────────────────────────────────────────────
  const controller = createProductsHttpController({ productsInputPort });
  const createRoutes = ({ requireAuth } = {}) => createProductsRoutes({ controller, requireAuth });

  const createNewProductStatusScheduler = () =>
    buildNewProductStatusScheduler({ productRepository, logger });

  // ── Public surface ───────────────────────────────────────────────────────
  return {
    createRoutes,
    removeProductsByCategory: productsInputPort.removeProductsByCategory,
    createNewProductStatusScheduler,
  };
};
