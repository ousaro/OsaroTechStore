import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { assertOrderRepositoryCommandPort } from "../../ports/output/orderRepositoryPort.js";
import { toOrderReadModel } from "../read-models/orderReadModel.js";

export const buildDeleteOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryCommandPort(orderRepository, ["findByIdAndDelete"]);
  if (typeof orderRepository?.isValidId !== "function") {
    throw new Error("orderRepository port must implement isValidId");
  }
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
