import { createOrder } from "../../domain/entities/Order.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildAddOrderUseCase = ({ orderRepository }) => {
  assertOrderRepositoryPort(orderRepository, ["create"]);

  return async (payload) => {
    const order = createOrder(payload);
    // Thin orchestration: validate/build in domain, persistence in repository.
    return orderRepository.create(order);
  };
};
