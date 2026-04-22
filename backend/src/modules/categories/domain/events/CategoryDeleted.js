import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export const createCategoryDeletedEvent = (category) => {
  if (!category || typeof category !== "object") {
    throw new DomainValidationError("category is required to create CategoryDeleted");
  }

  const categoryId = category._id ?? category.id;

  if (typeof categoryId !== "string" || categoryId.trim() === "") {
    throw new DomainValidationError("category id is required to create CategoryDeleted");
  }

  return Object.freeze({
    type: "CategoryDeleted",
    payload: {
      categoryId,
      name: category.name,
    },
  });
};
