import { createProduct } from "../../domain/entities/Product.js";
import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";
import { toProductReadModel } from "../read-models/productReadModel.js";

export const buildAddProductUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["create"]);

  return async ({ ownerId, payload }) => {
    const product = createProduct({ ownerId, payload });
    const createdProduct = await productRepository.create(product);
    return toProductReadModel(createdProduct);
  };
};
