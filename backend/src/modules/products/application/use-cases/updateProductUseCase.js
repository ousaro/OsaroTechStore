import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { createProductUpdatePatch } from "../../domain/entities/Product.js";
import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";

export const buildUpdateProductUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["isValidId", "findById", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!productRepository.isValidId(id)) {
      throw new ApiError("Invalid Product ID", 404);
    }

    let currentProduct = null;
    if (updates.raw_price !== undefined || updates.discount !== undefined) {
      currentProduct = await productRepository.findById(id);
      if (!currentProduct) {
        throw new ApiError("Product not found", 404);
      }
    }

    const patch = createProductUpdatePatch(updates, currentProduct);
    const product = await productRepository.findByIdAndUpdate(id, patch);
    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    return product;
  };
};
