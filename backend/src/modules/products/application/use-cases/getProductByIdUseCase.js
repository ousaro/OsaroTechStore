import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";

export const buildGetProductByIdUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["findById", "findRelated"]);
  return async ({ productId }) => {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    const relatedProducts = await productRepository.findRelated(productId);

    return {
      product,
      relatedProducts,
    };
  };
};
