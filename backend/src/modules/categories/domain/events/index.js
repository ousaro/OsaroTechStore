import { createDomainEvent } from "../../../../shared/domain/events/createDomainEvent.js";

export const createCategoryDeletedEvent = (category) =>
  createDomainEvent("CategoryDeleted", {
    categoryId:   category._id,
    categoryName: category.name,
  });

export const createCategoryCreatedEvent = (category) =>
  createDomainEvent("CategoryCreated", {
    categoryId:   category._id,
    categoryName: category.name,
  });
