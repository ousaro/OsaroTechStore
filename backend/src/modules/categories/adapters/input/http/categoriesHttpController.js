import { asyncHandler } from "../../../../../shared/infrastructure/http/asyncHandler.js";
import { assertCategoriesInputPort } from "../../../ports/input/categoriesInputPort.js";

export const createCategoriesHttpController = ({ categoriesInputPort }) => {
  assertCategoriesInputPort(categoriesInputPort);

  const getAllCategoriesHandler = asyncHandler(async (req, res) => {
    const payload = await categoriesInputPort.getAllCategories();
    return res.status(200).json(payload);
  });

  const addNewCategoryHandler = asyncHandler(async (req, res) => {
    const payload = await categoriesInputPort.addNewCategory(req.body);
    return res.status(201).json(payload);
  });

  const deleteCategoryHandler = asyncHandler(async (req, res) => {
    const payload = await categoriesInputPort.deleteCategory({ id: req.params.id });
    return res.status(200).json(payload);
  });

  return {
    getAllCategoriesHandler,
    addNewCategoryHandler,
    deleteCategoryHandler,
  };
};
