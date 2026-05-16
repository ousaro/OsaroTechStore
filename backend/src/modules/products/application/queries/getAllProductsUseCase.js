import { toProductReadModel } from "../read-models/productReadModel.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const toPagination = ({ limit, offset } = {}) => ({
  limit: Math.min(Math.max(Number.parseInt(limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT),
  offset: Math.max(Number.parseInt(offset, 10) || 0, 0),
});

export const buildGetAllProductsUseCase =
  ({ productRepository }) =>
  async ({ category, status, limit, offset } = {}) => {
    const records = await productRepository.findAll({
      category,
      status,
      ...toPagination({ limit, offset }),
    });
    return records.map(toProductReadModel);
  };
