import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { createOrderUpdatePatch, transitionOrderStatus } from "../../domain/entities/Order.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildUpdateOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findById", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!orderRepository.isValidId(id)) {
      throw new OrderNotFoundError("Invalid order ID");
    }

    const patchUpdates = { ...updates };

    if (patchUpdates.status !== undefined) {
      const currentOrder = await orderRepository.findById(id);

      if (!currentOrder) {
        throw new OrderNotFoundError("Order not found");
      }

      patchUpdates.status = transitionOrderStatus(currentOrder, patchUpdates.status).toPrimitives();
    }

    const patch = createOrderUpdatePatch(patchUpdates);
    const order = await orderRepository.findByIdAndUpdate(id, patch);
    if (!order) {
      throw new OrderNotFoundError("Order not found");
    }

    return order;
  };
};
