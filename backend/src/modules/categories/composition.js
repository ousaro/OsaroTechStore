import { buildGetAllCategoriesUseCase } from "./application/queries/getAllCategoriesUseCase.js";
import { buildAddNewCategoryUseCase } from "./application/commands/addNewCategoryUseCase.js";
import { buildDeleteCategoryUseCase } from "./application/commands/deleteCategoryUseCase.js";
import { createCategoriesInputPort } from "./ports/input/categoriesInputPort.js";
import { createMongooseCategoryRepository } from "./adapters/output/repositories/mongooseCategoryRepository.js";
import { createCategoriesHttpController } from "./adapters/input/http/categoriesHttpController.js";
import { applicationEventBus } from "../../app/applicationEventBus.js";

const categoryRepository = createMongooseCategoryRepository();
const categoryEventPublisher = applicationEventBus;

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

export const {
  getAllCategoriesHandler,
  addNewCategoryHandler,
  deleteCategoryHandler,
} = createCategoriesHttpController({
  categoriesInputPort,
});
