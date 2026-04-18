import { buildGetAllCategoriesUseCase } from "./application/use-cases/getAllCategoriesUseCase.js";
import { buildAddNewCategoryUseCase } from "./application/use-cases/addNewCategoryUseCase.js";
import { buildDeleteCategoryUseCase } from "./application/use-cases/deleteCategoryUseCase.js";
import { createMongooseCategoryRepository } from "./infrastructure/repositories/mongooseCategoryRepository.js";
import { deleteProductsByCategoryId } from "../products/index.js";
import { createCategoriesHttpController } from "./infrastructure/http/categoriesHttpController.js";

const categoryRepository = createMongooseCategoryRepository();

const getAllCategoriesUseCase = buildGetAllCategoriesUseCase({
  categoryRepository,
});
const addNewCategoryUseCase = buildAddNewCategoryUseCase({
  categoryRepository,
});
const deleteCategoryUseCase = buildDeleteCategoryUseCase({
  categoryRepository,
  deleteProductsByCategoryId,
});

export const {
  getAllCategoriesHandler,
  addNewCategoryHandler,
  deleteCategoryHandler,
} = createCategoriesHttpController({
  getAllCategoriesUseCase,
  addNewCategoryUseCase,
  deleteCategoryUseCase,
});
