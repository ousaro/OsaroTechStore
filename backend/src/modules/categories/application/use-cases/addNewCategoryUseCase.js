import { createCategory } from "../../domain/entities/Category.js";
import { assertCategoryRepositoryPort } from "../../ports/output/categoryRepositoryPort.js";

export const buildAddNewCategoryUseCase = ({ categoryRepository }) => {
  assertCategoryRepositoryPort(categoryRepository, ["create"]);

  return async ({ name, description, image }) => {
    const category = createCategory({ name, description, image });
    return categoryRepository.create(category);
  };
};
