import { buildGetAllCategoriesUseCase } from "./application/queries/getAllCategoriesUseCase.js";
import { buildAddNewCategoryUseCase } from "./application/commands/addNewCategoryUseCase.js";
import { buildDeleteCategoryUseCase } from "./application/commands/deleteCategoryUseCase.js";
import { createCategoriesInputPort } from "./ports/input/categoriesInputPort.js";
import { createMongooseCategoryRepository } from "./adapters/output/repositories/mongooseCategoryRepository.js";
import { createCategoriesHttpController } from "./adapters/input/http/categoriesHttpController.js";

const categoryRepository = createMongooseCategoryRepository();
const defaultCategoryEventPublisher = {
  async publish() {},
};

const getAllCategoriesUseCase = buildGetAllCategoriesUseCase({
  categoryRepository,
});
const addNewCategoryUseCase = buildAddNewCategoryUseCase({
  categoryRepository,
});
const buildCategoryModule = ({
  categoryEventPublisher = defaultCategoryEventPublisher,
} = {}) => {
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
  } = buildCategoryModule(options));
};

configureCategoriesModule();
