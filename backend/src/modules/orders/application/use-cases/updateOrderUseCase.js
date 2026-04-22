import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { createOrderUpdatePatch } from "../../domain/entities/Order.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildUpdateOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!orderRepository.isValidId(id)) {
      throw new OrderNotFoundError("Invalid order ID");
    }

    const patch = createOrderUpdatePatch(updates);
    const order = await orderRepository.findByIdAndUpdate(id, patch);
    if (!order) {
      throw new OrderNotFoundError("Order not found");
    }

    return order;
  };
};
