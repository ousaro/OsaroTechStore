import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";

export const buildRemoveProductsByCategoryUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["deleteByCategoryId"]);

  return async ({ categoryId }) => {
    return productRepository.deleteByCategoryId(categoryId);
  };
};
