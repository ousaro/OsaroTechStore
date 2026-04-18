import { createProduct } from "../../domain/entities/Product.js";
import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";

export const buildAddProductUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["create"]);

  return async ({ ownerId, payload }) => {
    const product = createProduct({ ownerId, payload });
    return productRepository.create(product);
  };
};
