import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildUpdateOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!orderRepository.isValidId(id)) {
      throw new ApiError("Invalid order ID", 404);
    }

    const order = await orderRepository.findByIdAndUpdate(id, updates);
    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    return order;
  };
};
