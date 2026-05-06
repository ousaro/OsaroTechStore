import { CategoryNotFoundError } from "../errors/CategoryApplicationError.js";
import { toCategoryReadModel }   from "../read-models/categoryReadModel.js";
import { assertNonEmptyString }  from "../../../../shared/kernel/assertions/index.js";

export const buildUpdateCategoryUseCase = ({ categoryRepository }) =>
  async ({ id, updates }) => {
    assertNonEmptyString(id, "id");
    const saved = await categoryRepository.updateById(id, updates);
    if (!saved) throw new CategoryNotFoundError(`Category ${id} not found`);
    return toCategoryReadModel(saved);
  };
