export const createCategoriesInputPort = ({
  getAllCategories,
  addNewCategory,
  deleteCategory,
}) => {
  return assertCategoriesInputPort({
    getAllCategories,
    addNewCategory,
    deleteCategory,
  });
};

export const assertCategoriesInputPort = (categoriesInputPort) => {
  if (!categoriesInputPort || typeof categoriesInputPort !== "object") {
    throw new Error("categoriesInputPort is required");
  }

  const requiredMethods = ["getAllCategories", "addNewCategory", "deleteCategory"];

  for (const methodName of requiredMethods) {
    if (typeof categoriesInputPort[methodName] !== "function") {
      throw new Error(`categoriesInputPort must implement ${methodName}`);
    }
  }

  return categoriesInputPort;
};
