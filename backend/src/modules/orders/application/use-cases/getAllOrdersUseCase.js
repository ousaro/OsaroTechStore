import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildGetAllOrdersUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["findAllSorted"]);
  return async () => {
    return orderRepository.findAllSorted();
  };
};
