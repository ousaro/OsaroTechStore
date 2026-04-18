import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildDeleteOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findByIdAndDelete"]);
  return async ({ id }) => {
    if (!orderRepository.isValidId(id)) {
      const error = new Error("No such Order");
      error.statusCode = 404;
      throw error;
    }

    const deletedOrder = await orderRepository.findByIdAndDelete(id);
    if (!deletedOrder) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    return deletedOrder;
  };
};
