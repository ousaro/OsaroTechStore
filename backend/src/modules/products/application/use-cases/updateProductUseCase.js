import { createProductUpdatePatch } from "../../domain/entities/Product.js";

export const buildUpdateProductUseCase = ({ productRepository }) => {
  return async ({ id, updates }) => {
    if (!productRepository.isValidId(id)) {
      const error = new Error("Invalid Product ID");
      error.statusCode = 404;
      throw error;
    }

    const patch = createProductUpdatePatch(updates);
    const product = await productRepository.findByIdAndUpdate(id, patch);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    return product;
  };
};
