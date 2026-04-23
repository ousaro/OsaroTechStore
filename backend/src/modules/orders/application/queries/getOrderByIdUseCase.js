import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";
import { toOrderReadModel } from "../read-models/orderReadModel.js";

export const buildGetOrderByIdUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findById"]);
  return async ({ id }) => {
    if (!orderRepository.isValidId(id)) {
      throw new OrderNotFoundError("Invalid order ID");
    }

    const order = await orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundError("Order not found");
    }

    return toOrderReadModel(order);
  };
};
