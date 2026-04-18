import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";

export const buildGetAllProductsUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["findAll"]);
  return async () => {
    return productRepository.findAll();
  };
};
