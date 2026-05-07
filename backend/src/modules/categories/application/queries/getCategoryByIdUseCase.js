import { CategoryNotFoundError } from "../errors/CategoryApplicationError.js";
import { toCategoryReadModel } from "../read-models/categoryReadModel.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const buildGetCategoryByIdUseCase =
  ({ categoryRepository }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");
    const record = await categoryRepository.findById(id);
    if (!record) throw new CategoryNotFoundError(`Category ${id} not found`);
    return toCategoryReadModel(record);
  };
