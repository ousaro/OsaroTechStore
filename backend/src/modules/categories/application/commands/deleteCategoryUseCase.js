import { createCategoryDeletedEvent } from "../../domain/events/index.js";
import { CategoryNotFoundError }      from "../errors/CategoryApplicationError.js";
import { toCategoryReadModel }        from "../read-models/categoryReadModel.js";
import { assertNonEmptyString }       from "../../../../shared/kernel/assertions/index.js";

export const buildDeleteCategoryUseCase = ({ categoryRepository, categoryEventPublisher, logger }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");
    const saved = await categoryRepository.deleteById(id);
    if (!saved) throw new CategoryNotFoundError(`Category ${id} not found`);
    await categoryEventPublisher.publish(createCategoryDeletedEvent(saved));
    logger?.info({ msg: "Category deleted", categoryId: id });
    return toCategoryReadModel(saved);
  };
