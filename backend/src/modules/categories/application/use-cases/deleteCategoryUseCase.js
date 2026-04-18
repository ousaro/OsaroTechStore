import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertCategoryRepositoryPort } from "../../ports/output/categoryRepositoryPort.js";

export const buildDeleteCategoryUseCase = ({ categoryRepository, deleteProductsByCategoryId }) => {
  assertCategoryRepositoryPort(categoryRepository, ["findByIdAndDelete"]);
  return async ({ id }) => {
    if (!id) {
      throw new ApiError("Category ID is required", 400);
    }

    await deleteProductsByCategoryId(id);
    const deleted = await categoryRepository.findByIdAndDelete(id);

    if (!deleted) {
      throw new ApiError("Category not found", 404);
    }

    return deleted;
  };
};
