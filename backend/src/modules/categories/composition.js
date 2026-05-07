import { buildAddCategoryUseCase } from "./application/commands/addCategoryUseCase.js";
import { buildUpdateCategoryUseCase } from "./application/commands/updateCategoryUseCase.js";
import { buildDeleteCategoryUseCase } from "./application/commands/deleteCategoryUseCase.js";
import { buildGetAllCategoriesUseCase } from "./application/queries/getAllCategoriesUseCase.js";
import { buildGetCategoryByIdUseCase } from "./application/queries/getCategoryByIdUseCase.js";
import { createCategoriesInputPort } from "./ports/input/categoriesInputPort.js";
import {
  assertCategoryRepositoryPort,
  assertCategoryEventPublisherPort,
} from "./ports/output/categoriesOutputPort.js";
import { createCategoriesHttpController } from "./adapters/input/http/categoriesHttpController.js";
import { createCategoriesRoutes } from "./adapters/input/http/categoriesRoutes.js";

export const createCategoriesModule = ({ categoryRepository, categoryEventPublisher, logger }) => {
  // ── Validate output ports ────────────────────────────────────────────────
  assertCategoryRepositoryPort(categoryRepository);
  assertCategoryEventPublisherPort(categoryEventPublisher);

  // ── Use cases ────────────────────────────────────────────────────────────
  const addCategory = buildAddCategoryUseCase({
    categoryRepository,
    categoryEventPublisher,
    logger,
  });
  const updateCategory = buildUpdateCategoryUseCase({ categoryRepository });
  const deleteCategory = buildDeleteCategoryUseCase({
    categoryRepository,
    categoryEventPublisher,
    logger,
  });
  const getAllCategories = buildGetAllCategoriesUseCase({ categoryRepository });
  const getCategoryById = buildGetCategoryByIdUseCase({ categoryRepository });

  // ── Input port ───────────────────────────────────────────────────────────
  const categoriesInputPort = createCategoriesInputPort({
    addCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById,
  });

  // ── HTTP adapter ─────────────────────────────────────────────────────────
  const controller = createCategoriesHttpController({ categoriesInputPort });

  const createRoutes = ({ requireAuth } = {}) =>
    createCategoriesRoutes({ controller, requireAuth });

  // ── Public surface ───────────────────────────────────────────────────────
  return {
    createRoutes,
  };
};
