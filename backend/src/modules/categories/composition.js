import {
  buildAddCategoryUseCase, buildUpdateCategoryUseCase, buildDeleteCategoryUseCase,
  buildGetAllCategoriesUseCase, buildGetCategoryByIdUseCase,
} from "./application/useCases.js";
import { createCategoriesHttpController } from "./adapters/input/http/categoriesHttpController.js";
import { createCategoriesRoutes }         from "./adapters/input/http/categoriesRoutes.js";

export const createCategoriesModule = ({ categoryRepository, categoryEventPublisher, logger }) => {
  const addCategory    = buildAddCategoryUseCase({ categoryRepository, categoryEventPublisher, logger });
  const updateCategory = buildUpdateCategoryUseCase({ categoryRepository });
  const deleteCategory = buildDeleteCategoryUseCase({ categoryRepository, categoryEventPublisher, logger });
  const getAllCategories = buildGetAllCategoriesUseCase({ categoryRepository });
  const getCategoryById = buildGetCategoryByIdUseCase({ categoryRepository });

  const commandPort = { addCategory, updateCategory, deleteCategory };
  const queryPort   = { getAllCategories, getCategoryById };
  const controller  = createCategoriesHttpController({ commandPort, queryPort });

  return {
    createRoutes: ({ requireAuth } = {}) => createCategoriesRoutes({ controller, requireAuth }),
  };
};
