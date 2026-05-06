import { toProductReadModel } from "../read-models/productReadModel.js";

export const buildGetAllProductsUseCase = ({ productRepository }) =>
  async ({ category, status } = {}) => {
    const records = await productRepository.findAll({ category, status });
    return records.map(toProductReadModel);
  };
