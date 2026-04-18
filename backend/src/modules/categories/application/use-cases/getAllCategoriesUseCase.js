export const buildGetAllCategoriesUseCase = ({ categoryRepository }) => {
  return async () => {
    return categoryRepository.findAllSorted();
  };
};
