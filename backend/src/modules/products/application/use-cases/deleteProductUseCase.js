import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";

export const buildDeleteProductUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["isValidId", "findByIdAndDelete"]);
  return async ({ id }) => {
    if (!productRepository.isValidId(id)) {
      const error = new Error("No such Product");
      error.statusCode = 404;
      throw error;
    }

    const deleted = await productRepository.findByIdAndDelete(id);
    if (!deleted) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    return deleted;
  };
};
