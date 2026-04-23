import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";
import { toProductReadModel } from "../read-models/productReadModel.js";

export const buildGetAllProductsUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["findAll"]);
  return async () => {
    const products = await productRepository.findAll();
    return products.map(toProductReadModel);
  };
};
