import { assertCategoryRepositoryPort } from "../../ports/output/categoryRepositoryPort.js";
import { toCategoryReadModel } from "../read-models/categoryReadModel.js";

export const buildGetAllCategoriesUseCase = ({ categoryRepository }) => {
  assertCategoryRepositoryPort(categoryRepository, ["findAllSorted"]);
  return async () => {
    const categories = await categoryRepository.findAllSorted();
    return categories.map(toCategoryReadModel);
  };
};
