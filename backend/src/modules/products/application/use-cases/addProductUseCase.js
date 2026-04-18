import { createProduct } from "../../domain/entities/Product.js";

export const buildAddProductUseCase = ({ productRepository }) => {
  return async ({ ownerId, payload }) => {
    const product = createProduct({ ownerId, payload });
    return productRepository.create(product);
  };
};
