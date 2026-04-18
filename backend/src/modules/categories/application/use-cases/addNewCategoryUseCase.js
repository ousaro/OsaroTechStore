import { createCategory } from "../../domain/entities/Category.js";

export const buildAddNewCategoryUseCase = ({ categoryRepository }) => {
  return async ({ name, description, image }) => {
    const category = createCategory({ name, description, image });
    return categoryRepository.create(category);
  };
};
