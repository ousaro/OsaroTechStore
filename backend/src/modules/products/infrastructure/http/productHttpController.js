import { asyncHandler } from "../../../../shared/infrastructure/http/asyncHandler.js";
import { assertProductsInputPort } from "../../ports/input/productsInputPort.js";

export const createProductHttpController = ({ productsInputPort }) => {
  assertProductsInputPort(productsInputPort);

  const getAllProductsHandler = asyncHandler(async (req, res) => {
    const products = await productsInputPort.getAllProducts();
    return res.status(200).json(products);
  });

  const getProductByIdHandler = asyncHandler(async (req, res) => {
    const payload = await productsInputPort.getProductById({ productId: req.params.id });
    return res.status(200).json(payload);
  });

  const addProductHandler = asyncHandler(async (req, res) => {
    const payload = await productsInputPort.addProduct({
      ownerId: req.user._id,
      payload: req.body,
    });
    return res.status(201).json(payload);
  });

  const updateProductHandler = asyncHandler(async (req, res) => {
    const payload = await productsInputPort.updateProduct({ id: req.params.id, updates: req.body });
    return res.status(200).json(payload);
  });

  const deleteProductHandler = asyncHandler(async (req, res) => {
    const payload = await productsInputPort.deleteProduct({ id: req.params.id });
    return res.status(200).json(payload);
  });

  return {
    getAllProductsHandler,
    getProductByIdHandler,
    addProductHandler,
    updateProductHandler,
    deleteProductHandler,
  };
};
