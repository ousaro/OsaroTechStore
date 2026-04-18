// Backward-compatible exports for any existing imports.
import {
  getAllCategoriesHandler as getAllCategories,
  addNewCategoryHandler as addNewCategory,
  deleteCategoryHandler as deleteCategory,
} from "../modules/categories/index.js";

export { getAllCategories, addNewCategory, deleteCategory };
