import { assertCategoryRepositoryPort } from "../../ports/output/categoryRepositoryPort.js";

export const buildGetAllCategoriesUseCase = ({ categoryRepository }) => {
  assertCategoryRepositoryPort(categoryRepository, ["findAllSorted"]);
  return async () => {
    return categoryRepository.findAllSorted();
  };
};
