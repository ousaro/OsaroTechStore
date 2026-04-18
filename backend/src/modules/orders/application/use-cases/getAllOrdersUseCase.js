export const buildGetAllOrdersUseCase = ({ orderRepository }) => {
  return async () => {
    return orderRepository.findAllSorted();
  };
};
