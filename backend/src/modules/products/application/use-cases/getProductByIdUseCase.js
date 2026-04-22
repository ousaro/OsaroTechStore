import { ProductNotFoundError } from "../errors/ProductApplicationError.js";
import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";

export const buildGetProductByIdUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["findById", "findRelated"]);
  return async ({ productId }) => {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundError("Product not found");
    }

    const relatedProducts = await productRepository.findRelated(productId);

    return {
      product,
      relatedProducts,
    };
  };
};
