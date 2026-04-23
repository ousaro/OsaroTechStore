import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { createOrderUpdatePatch } from "../../domain/entities/Order.js";
import { prepareOrderUpdatePatch as prepareOrderDomainUpdatePatch } from "../../domain/services/orderUpdatePolicyService.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";
import { toOrderReadModel } from "../read-models/orderReadModel.js";

export const buildUpdateOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["isValidId", "findById", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!orderRepository.isValidId(id)) {
      throw new OrderNotFoundError("Invalid order ID");
    }

    const currentOrder = await orderRepository.findById(id);

    if (!currentOrder) {
      throw new OrderNotFoundError("Order not found");
    }

    const patchUpdates = prepareOrderDomainUpdatePatch({
      currentOrder,
      updates: { ...updates },
    });

    const patch = createOrderUpdatePatch(patchUpdates);
    const order = await orderRepository.findByIdAndUpdate(id, patch);
    if (!order) {
      throw new OrderNotFoundError("Order not found");
    }

    return toOrderReadModel(order);
  };
};
