import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";
import { assertCategoriesInputPort } from "../../../ports/input/categoriesInputPort.js";

export const createCategoriesHttpController = ({ categoriesInputPort }) => {
  assertCategoriesInputPort(categoriesInputPort);

  return {
    getAllCategories: asyncHandler(async (req, res) =>
      res.json(
        await categoriesInputPort.getAllCategories({
          limit: req.query.limit,
          offset: req.query.offset,
        })
      )
    ),
    getCategoryById: asyncHandler(async (req, res) =>
      res.json(await categoriesInputPort.getCategoryById({ id: req.params.id }))
    ),
    addCategory: asyncHandler(async (req, res) =>
      res.status(201).json(await categoriesInputPort.addCategory(req.body))
    ),
    updateCategory: asyncHandler(async (req, res) =>
      res.json(await categoriesInputPort.updateCategory({ id: req.params.id, updates: req.body }))
    ),
    deleteCategory: asyncHandler(async (req, res) =>
      res.json(await categoriesInputPort.deleteCategory({ id: req.params.id }))
    ),
  };
};
