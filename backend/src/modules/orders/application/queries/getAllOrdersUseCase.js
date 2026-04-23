import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";
import { toOrderReadModel } from "../read-models/orderReadModel.js";

export const buildGetAllOrdersUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["findAllSorted"]);
  return async () => {
    const orders = await orderRepository.findAllSorted();
    return orders.map(toOrderReadModel);
  };
};
