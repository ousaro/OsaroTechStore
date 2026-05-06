import { ProductNotFoundError } from "../errors/ProductApplicationError.js";
import { toProductReadModel }   from "../read-models/productReadModel.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const buildGetProductByIdUseCase = ({ productRepository }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");
    const record = await productRepository.findById(id);
    if (!record) throw new ProductNotFoundError(`Product ${id} not found`);
    return toProductReadModel(record);
  };
