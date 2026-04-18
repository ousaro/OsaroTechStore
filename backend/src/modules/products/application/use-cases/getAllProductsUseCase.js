export const buildGetAllProductsUseCase = ({ productRepository }) => {
  return async () => {
    return productRepository.findAll();
  };
};
