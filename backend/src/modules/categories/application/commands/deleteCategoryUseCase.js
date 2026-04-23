import {
  CategoryNotFoundError,
  CategoryValidationError,
} from "../errors/CategoryApplicationError.js";
import { createCategoryDeletedEvent } from "../../domain/events/CategoryDeleted.js";
import { assertCategoryRepositoryPort } from "../../ports/output/categoryRepositoryPort.js";
import { assertCategoryEventPublisherPort } from "../../ports/output/categoryEventPublisherPort.js";
import { toCategoryReadModel } from "../read-models/categoryReadModel.js";

export const buildDeleteCategoryUseCase = ({
  categoryRepository,
  categoryEventPublisher,
}) => {
  assertCategoryRepositoryPort(categoryRepository, ["findByIdAndDelete"]);
  assertCategoryEventPublisherPort(categoryEventPublisher, ["publish"]);
  return async ({ id }) => {
    if (!id) {
      throw new CategoryValidationError("Category ID is required");
    }

    const deleted = await categoryRepository.findByIdAndDelete(id);

    if (!deleted) {
      throw new CategoryNotFoundError("Category not found");
    }

    await categoryEventPublisher.publish(createCategoryDeletedEvent(deleted));

    return toCategoryReadModel(deleted);
  };
};
