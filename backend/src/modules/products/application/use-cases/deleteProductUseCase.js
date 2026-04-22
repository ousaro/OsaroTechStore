import { ProductNotFoundError } from "../errors/ProductApplicationError.js";
import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";

export const buildDeleteProductUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["isValidId", "findByIdAndDelete"]);
  return async ({ id }) => {
    if (!productRepository.isValidId(id)) {
      throw new ProductNotFoundError("No such Product");
    }

    const deleted = await productRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new ProductNotFoundError("Product not found");
    }

    return deleted;
  };
};
