import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";

export const createProductsHttpController = ({ commandPort, queryPort }) => ({
  getAllProducts:  asyncHandler(async (req, res) => {
    const products = await queryPort.getAllProducts({
      category: req.query.category,
      status:   req.query.status,
    });
    res.status(200).json(products);
  }),

  getProductById: asyncHandler(async (req, res) => {
    const product = await queryPort.getProductById({ id: req.params.id });
    res.status(200).json(product);
  }),

  addProduct:     asyncHandler(async (req, res) => {
    const product = await commandPort.addProduct(req.body);
    res.status(201).json(product);
  }),

  updateProduct:  asyncHandler(async (req, res) => {
    const product = await commandPort.updateProduct({ id: req.params.id, updates: req.body });
    res.status(200).json(product);
  }),

  deleteProduct:  asyncHandler(async (req, res) => {
    const product = await commandPort.deleteProduct({ id: req.params.id });
    res.status(200).json(product);
  }),
});
