import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";
import { toOrderReadModel } from "../read-models/orderReadModel.js";

export const buildDeleteOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findByIdAndDelete"]);
  return async ({ id }) => {
    if (!orderRepository.isValidId(id)) {
      throw new OrderNotFoundError("No such Order");
    }

    const deletedOrder = await orderRepository.findByIdAndDelete(id);
    if (!deletedOrder) {
      throw new OrderNotFoundError("Order not found");
    }

    return toOrderReadModel(deletedOrder);
  };
};
