import { assertProductsInputPort } from "../../ports/input/productsInputPort.js";

export const createProductHttpController = ({ productsInputPort }) => {
  assertProductsInputPort(productsInputPort);

  const getAllProductsHandler = async (req, res) => {
    const products = await productsInputPort.getAllProducts();
    return res.status(200).json(products);
  };

  const getProductByIdHandler = async (req, res) => {
    try {
      const payload = await productsInputPort.getProductById({ productId: req.params.id });
      return res.status(200).json(payload);
    } catch (error) {
      if (error?.statusCode === 404) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({
        message: "Failed to fetch product",
        error: error.message,
      });
    }
  };

  const addProductHandler = async (req, res) => {
    try {
      const payload = await productsInputPort.addProduct({
        ownerId: req.user._id,
        payload: req.body,
      });
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

  const updateProductHandler = async (req, res) => {
    try {
      const payload = await productsInputPort.updateProduct({ id: req.params.id, updates: req.body });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  };

  const deleteProductHandler = async (req, res) => {
    try {
      const payload = await productsInputPort.deleteProduct({ id: req.params.id });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  };

  return {
    getAllProductsHandler,
    getProductByIdHandler,
    addProductHandler,
    updateProductHandler,
    deleteProductHandler,
  };
};
