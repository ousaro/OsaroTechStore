import { ProductNotFoundError } from "../errors/ProductApplicationError.js";
import { toProductReadModel } from "../read-models/productReadModel.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const buildUpdateProductUseCase =
  ({ productRepository }) =>
  async ({ id, updates }) => {
    assertNonEmptyString(id, "id");
    const saved = await productRepository.updateById(id, updates);
    if (!saved) throw new ProductNotFoundError(`Product ${id} not found`);
    return toProductReadModel(saved);
  };
