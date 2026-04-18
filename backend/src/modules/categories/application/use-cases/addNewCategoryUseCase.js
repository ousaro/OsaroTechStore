export const buildAddNewCategoryUseCase = ({ categoryRepository }) => {
  return async ({ name, description, image }) => {
    const emptyFields = [];
    if (!name) emptyFields.push("name");
    if (!description) emptyFields.push("description");
    if (!image) emptyFields.push("image");

    if (emptyFields.length > 0) {
      const error = new Error("Please fill in all the fields");
      error.statusCode = 400;
      error.meta = { emptyFields };
      throw error;
    }

    return categoryRepository.create({ name, description, image });
  };
};
