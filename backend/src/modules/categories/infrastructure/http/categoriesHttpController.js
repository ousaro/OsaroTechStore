import { assertCategoriesInputPort } from "../../ports/input/categoriesInputPort.js";

export const createCategoriesHttpController = ({ categoriesInputPort }) => {
  assertCategoriesInputPort(categoriesInputPort);

  const getAllCategoriesHandler = async (req, res) => {
    const payload = await categoriesInputPort.getAllCategories();
    return res.status(200).json(payload);
  };

  const addNewCategoryHandler = async (req, res) => {
    try {
      const payload = await categoriesInputPort.addNewCategory(req.body);
      return res.status(201).json(payload);
    } catch (error) {
      if (error.meta?.emptyFields) {
        return res.status(error.statusCode || 400).json({
          error: error.message,
          emptyFields: error.meta.emptyFields,
        });
      }
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  };

  const deleteCategoryHandler = async (req, res) => {
    try {
      const payload = await categoriesInputPort.deleteCategory({ id: req.params.id });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  };

  return {
    getAllCategoriesHandler,
    addNewCategoryHandler,
    deleteCategoryHandler,
  };
};
