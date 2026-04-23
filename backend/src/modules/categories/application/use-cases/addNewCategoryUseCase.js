import { createCategory } from "../../domain/entities/Category.js";
import { assertCategoryRepositoryPort } from "../../ports/output/categoryRepositoryPort.js";
import { toCategoryReadModel } from "../read-models/categoryReadModel.js";

export const buildAddNewCategoryUseCase = ({ categoryRepository }) => {
  assertCategoryRepositoryPort(categoryRepository, ["create"]);

  return async ({ name, description, image }) => {
    const category = createCategory({ name, description, image });
    const createdCategory = await categoryRepository.create(category);
    return toCategoryReadModel(createdCategory);
  };
};
