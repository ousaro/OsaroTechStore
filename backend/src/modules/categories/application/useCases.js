import { createCategory }           from "../../domain/entities/Category.js";
import { createCategoryDeletedEvent, createCategoryCreatedEvent }
                                   from "../../domain/events/index.js";
import { CategoryNotFoundError }   from "../errors/CategoryApplicationError.js";
import { assertNonEmptyString }    from "../../../../shared/kernel/assertions/index.js";

const toReadModel = (r) => r
  ? { _id: r._id?.toString(), name: r.name, description: r.description,
      createdAt: r.createdAt, updatedAt: r.updatedAt }
  : null;

export const buildAddCategoryUseCase = ({ categoryRepository, categoryEventPublisher, logger }) =>
  async (data) => {
    const category = createCategory(data);
    const saved    = await categoryRepository.create(category.toPrimitives());
    await categoryEventPublisher.publish(createCategoryCreatedEvent(saved));
    logger?.info({ msg: "Category created", categoryId: saved._id });
    return toReadModel(saved);
  };

export const buildUpdateCategoryUseCase = ({ categoryRepository }) =>
  async ({ id, updates }) => {
    assertNonEmptyString(id, "id");
    const saved = await categoryRepository.updateById(id, updates);
    if (!saved) throw new CategoryNotFoundError(`Category ${id} not found`);
    return toReadModel(saved);
  };

export const buildDeleteCategoryUseCase = ({ categoryRepository, categoryEventPublisher, logger }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");
    const saved = await categoryRepository.deleteById(id);
    if (!saved) throw new CategoryNotFoundError(`Category ${id} not found`);
    await categoryEventPublisher.publish(createCategoryDeletedEvent(saved));
    logger?.info({ msg: "Category deleted", categoryId: id });
    return toReadModel(saved);
  };

export const buildGetAllCategoriesUseCase = ({ categoryRepository }) =>
  async () => (await categoryRepository.findAll()).map(toReadModel);

export const buildGetCategoryByIdUseCase = ({ categoryRepository }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");
    const record = await categoryRepository.findById(id);
    if (!record) throw new CategoryNotFoundError(`Category ${id} not found`);
    return toReadModel(record);
  };
