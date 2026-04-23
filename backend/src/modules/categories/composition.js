import { buildGetAllCategoriesUseCase } from "./application/queries/getAllCategoriesUseCase.js";
import { buildAddNewCategoryUseCase } from "./application/commands/addNewCategoryUseCase.js";
import { buildDeleteCategoryUseCase } from "./application/commands/deleteCategoryUseCase.js";
import { createCategoriesInputPort } from "./ports/input/categoriesInputPort.js";
import { createCategoriesHttpController } from "./adapters/input/http/categoriesHttpController.js";

const defaultCategoryEventPublisher = {
  async publish() {},
};

export const createCategoriesModule = ({
  categoryRepository,
  categoryEventPublisher = defaultCategoryEventPublisher,
} = {}) => {
  const getAllCategoriesUseCase = buildGetAllCategoriesUseCase({
    categoryRepository,
  });
  const addNewCategoryUseCase = buildAddNewCategoryUseCase({
    categoryRepository,
  });
  const deleteCategoryUseCase = buildDeleteCategoryUseCase({
    categoryRepository,
    categoryEventPublisher,
  });
  const categoriesInputPort = createCategoriesInputPort({
    getAllCategories: getAllCategoriesUseCase,
    addNewCategory: addNewCategoryUseCase,
    deleteCategory: deleteCategoryUseCase,
  });

  return createCategoriesHttpController({
    categoriesInputPort,
  });
};

export let getAllCategoriesHandler;
export let addNewCategoryHandler;
export let deleteCategoryHandler;

export const configureCategoriesModule = (options = {}) => {
  ({
    getAllCategoriesHandler,
    addNewCategoryHandler,
    deleteCategoryHandler,
  } = createCategoriesModule(options));
};
