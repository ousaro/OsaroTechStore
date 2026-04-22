import {
  CategoryNotFoundError,
  CategoryValidationError,
} from "../errors/CategoryApplicationError.js";
import { assertCategoryRepositoryPort } from "../../ports/output/categoryRepositoryPort.js";

export const buildDeleteCategoryUseCase = ({ categoryRepository, removeProductsByCategory }) => {
  assertCategoryRepositoryPort(categoryRepository, ["findByIdAndDelete"]);
  return async ({ id }) => {
    if (!id) {
      throw new CategoryValidationError("Category ID is required");
    }

    await removeProductsByCategory({ categoryId: id });
    const deleted = await categoryRepository.findByIdAndDelete(id);

    if (!deleted) {
      throw new CategoryNotFoundError("Category not found");
    }

    return deleted;
  };
};
