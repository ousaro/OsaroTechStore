export const buildDeleteCategoryUseCase = ({ categoryRepository }) => {
  return async ({ id }) => {
    if (!id) {
      const error = new Error("Category ID is required");
      error.statusCode = 400;
      throw error;
    }

    await categoryRepository.deleteProductsByCategoryId(id);
    const deleted = await categoryRepository.findByIdAndDelete(id);

    if (!deleted) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    return deleted;
  };
};
