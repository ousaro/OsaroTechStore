import {
  CategoryNotFoundError,
  CategoryValidationError,
} from "../errors/CategoryApplicationError.js";
import { assertCategoryRepositoryPort } from "../../ports/output/categoryRepositoryPort.js";
import { assertProductCategoryCleanupPort } from "../../ports/output/productCategoryCleanupPort.js";

export const buildDeleteCategoryUseCase = ({
  categoryRepository,
  productCategoryCleanup,
}) => {
  assertCategoryRepositoryPort(categoryRepository, ["findByIdAndDelete"]);
  assertProductCategoryCleanupPort(productCategoryCleanup, ["removeProductsByCategory"]);
  return async ({ id }) => {
    if (!id) {
      throw new CategoryValidationError("Category ID is required");
    }

    await productCategoryCleanup.removeProductsByCategory({ categoryId: id });
    const deleted = await categoryRepository.findByIdAndDelete(id);

    if (!deleted) {
      throw new CategoryNotFoundError("Category not found");
    }

    return deleted;
  };
};
