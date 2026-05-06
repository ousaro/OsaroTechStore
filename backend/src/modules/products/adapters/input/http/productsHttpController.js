import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";
import { assertProductsInputPort } from "../../../ports/input/productsInputPort.js";

export const createProductsHttpController = ({ productsInputPort }) => {
  assertProductsInputPort(productsInputPort);

  return {
    getAllProducts:  asyncHandler(async (req, res) => {
      const products = await productsInputPort.getAllProducts({
        category: req.query.category,
        status:   req.query.status,
      });
      res.status(200).json(products);
    }),

    getProductById: asyncHandler(async (req, res) => {
      const product = await productsInputPort.getProductById({ id: req.params.id });
      res.status(200).json(product);
    }),

    addProduct:     asyncHandler(async (req, res) => {
      const product = await productsInputPort.addProduct(req.body);
      res.status(201).json(product);
    }),

    updateProduct:  asyncHandler(async (req, res) => {
      const product = await productsInputPort.updateProduct({ id: req.params.id, updates: req.body });
      res.status(200).json(product);
    }),

    deleteProduct:  asyncHandler(async (req, res) => {
      const product = await productsInputPort.deleteProduct({ id: req.params.id });
      res.status(200).json(product);
    }),
  };
};
