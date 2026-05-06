import { createCategory } from "../../domain/entities/Category.js";
import { createCategoryCreatedEvent } from "../../domain/events/index.js";
import { toCategoryReadModel } from "../read-models/categoryReadModel.js";

export const buildAddCategoryUseCase = ({ categoryRepository, categoryEventPublisher, logger }) =>
  async (data) => {
    const category = createCategory(data);
    const saved    = await categoryRepository.create(category.toPrimitives());
    await categoryEventPublisher.publish(createCategoryCreatedEvent(saved));
    logger?.info({ msg: "Category created", categoryId: saved._id });
    return toCategoryReadModel(saved);
  };
