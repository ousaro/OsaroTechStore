import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildGetOrderByIdUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findById"]);
  return async ({ id }) => {
    if (!orderRepository.isValidId(id)) {
      throw new ApiError("Invalid order ID", 404);
    }

    const order = await orderRepository.findById(id);
    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    return order;
  };
};
