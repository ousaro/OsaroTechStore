import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { createOrderUpdatePatch } from "../../domain/entities/Order.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildUpdateOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!orderRepository.isValidId(id)) {
      throw new ApiError("Invalid order ID", 404);
    }

    const patch = createOrderUpdatePatch(updates);
    const order = await orderRepository.findByIdAndUpdate(id, patch);
    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    return order;
  };
};
