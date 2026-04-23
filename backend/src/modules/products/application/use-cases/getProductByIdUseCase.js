import { ProductNotFoundError } from "../errors/ProductApplicationError.js";
import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";
import { toProductReadModel } from "../read-models/productReadModel.js";

export const buildGetProductByIdUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["findById", "findRelated"]);
  return async ({ productId }) => {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundError("Product not found");
    }

    const relatedProducts = await productRepository.findRelated(productId);

    return {
      product: toProductReadModel(product),
      relatedProducts: relatedProducts.map(toProductReadModel),
    };
  };
};
