import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { createOrderUpdatePatch } from "../../domain/entities/Order.js";
import { prepareOrderLifecyclePatch } from "../../domain/services/orderLifecycleService.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildUpdateOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findById", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!orderRepository.isValidId(id)) {
      throw new OrderNotFoundError("Invalid order ID");
    }

    let patchUpdates = { ...updates };

    if (patchUpdates.status !== undefined || patchUpdates.paymentStatus !== undefined) {
      const currentOrder = await orderRepository.findById(id);

      if (!currentOrder) {
        throw new OrderNotFoundError("Order not found");
      }

      patchUpdates = prepareOrderLifecyclePatch({
        currentOrder,
        updates: patchUpdates,
      });
    }

    const patch = createOrderUpdatePatch(patchUpdates);
    const order = await orderRepository.findByIdAndUpdate(id, patch);
    if (!order) {
      throw new OrderNotFoundError("Order not found");
    }

    return order;
  };
};
