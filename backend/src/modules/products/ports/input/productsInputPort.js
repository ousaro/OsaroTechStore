export const createProductsInputPort = ({
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
}) => {
  return assertProductsInputPort({
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
  });
};

export const assertProductsInputPort = (productsInputPort) => {
  if (!productsInputPort || typeof productsInputPort !== "object") {
    throw new Error("productsInputPort is required");
  }

  const requiredMethods = [
    "getAllProducts",
    "getProductById",
    "addProduct",
    "updateProduct",
    "deleteProduct",
  ];

  for (const methodName of requiredMethods) {
    if (typeof productsInputPort[methodName] !== "function") {
      throw new Error(`productsInputPort must implement ${methodName}`);
    }
  }

  return productsInputPort;
};
