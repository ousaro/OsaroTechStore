import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildDeleteOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findByIdAndDelete"]);
  return async ({ id }) => {
    if (!orderRepository.isValidId(id)) {
      throw new ApiError("No such Order", 404);
    }

    const deletedOrder = await orderRepository.findByIdAndDelete(id);
    if (!deletedOrder) {
      throw new ApiError("Order not found", 404);
    }

    return deletedOrder;
  };
};
