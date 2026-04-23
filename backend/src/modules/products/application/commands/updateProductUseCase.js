import { createProductUpdatePatch } from "../../domain/entities/Product.js";
import { ProductNotFoundError } from "../errors/ProductApplicationError.js";
import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";
import { toProductReadModel } from "../read-models/productReadModel.js";

export const buildUpdateProductUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["isValidId", "findById", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!productRepository.isValidId(id)) {
      throw new ProductNotFoundError("Invalid Product ID");
    }

    let currentProduct = null;
    if (updates.raw_price !== undefined || updates.discount !== undefined) {
      currentProduct = await productRepository.findById(id);
      if (!currentProduct) {
        throw new ProductNotFoundError("Product not found");
      }
    }

    const patch = createProductUpdatePatch(updates, currentProduct);
    const product = await productRepository.findByIdAndUpdate(id, patch);
    if (!product) {
      throw new ProductNotFoundError("Product not found");
    }

    return toProductReadModel(product);
  };
};
