import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";

export const buildDeleteProductUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["isValidId", "findByIdAndDelete"]);
  return async ({ id }) => {
    if (!productRepository.isValidId(id)) {
      throw new ApiError("No such Product", 404);
    }

    const deleted = await productRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new ApiError("Product not found", 404);
    }

    return deleted;
  };
};
