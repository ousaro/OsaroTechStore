export const buildGetProductByIdUseCase = ({ productRepository }) => {
  return async ({ productId }) => {
    const product = await productRepository.findById(productId);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const relatedProducts = await productRepository.findRelated(productId);

    return {
      product,
      relatedProducts,
    };
  };
};
