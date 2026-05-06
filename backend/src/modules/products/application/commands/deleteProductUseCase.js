import { ProductNotFoundError } from "../errors/ProductApplicationError.js";
import { toProductReadModel }   from "../read-models/productReadModel.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const buildDeleteProductUseCase = ({ productRepository }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");
    const saved = await productRepository.deleteById(id);
    if (!saved) throw new ProductNotFoundError(`Product ${id} not found`);
    return toProductReadModel(saved);
  };
