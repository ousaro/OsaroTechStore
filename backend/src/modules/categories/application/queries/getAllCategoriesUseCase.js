import { toCategoryReadModel } from "../read-models/categoryReadModel.js";

export const buildGetAllCategoriesUseCase = ({ categoryRepository }) =>
  async () => (await categoryRepository.findAll()).map(toCategoryReadModel);
