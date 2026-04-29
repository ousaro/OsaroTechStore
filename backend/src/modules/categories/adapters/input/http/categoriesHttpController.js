import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";

export const createCategoriesHttpController = ({ commandPort, queryPort }) => ({
  getAllCategories:  asyncHandler(async (_req, res) => res.json(await queryPort.getAllCategories())),
  getCategoryById:  asyncHandler(async (req, res)  => res.json(await queryPort.getCategoryById({ id: req.params.id }))),
  addCategory:      asyncHandler(async (req, res)  => res.status(201).json(await commandPort.addCategory(req.body))),
  updateCategory:   asyncHandler(async (req, res)  => res.json(await commandPort.updateCategory({ id: req.params.id, updates: req.body }))),
  deleteCategory:   asyncHandler(async (req, res)  => res.json(await commandPort.deleteCategory({ id: req.params.id }))),
});
