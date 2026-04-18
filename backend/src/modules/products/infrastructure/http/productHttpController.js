export const createProductHttpController = ({
  getAllProductsUseCase,
  getProductByIdUseCase,
}) => {
  const getAllProductsHandler = async (req, res) => {
    const products = await getAllProductsUseCase();
    return res.status(200).json(products);
  };

  const getProductByIdHandler = async (req, res) => {
    try {
      const payload = await getProductByIdUseCase({ productId: req.params.id });
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

  return {
    getAllProductsHandler,
    getProductByIdHandler,
  };
};
