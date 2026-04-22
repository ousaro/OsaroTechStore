import { buildGetAllCategoriesUseCase } from "./application/use-cases/getAllCategoriesUseCase.js";
import { buildAddNewCategoryUseCase } from "./application/use-cases/addNewCategoryUseCase.js";
import { buildDeleteCategoryUseCase } from "./application/use-cases/deleteCategoryUseCase.js";
import { createCategoriesInputPort } from "./ports/input/categoriesInputPort.js";
import { createMongooseCategoryRepository } from "./infrastructure/repositories/mongooseCategoryRepository.js";
import { createCategoriesHttpController } from "./infrastructure/http/categoriesHttpController.js";
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
