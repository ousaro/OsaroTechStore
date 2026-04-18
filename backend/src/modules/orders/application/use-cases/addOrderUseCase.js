import { createOrder } from "../../domain/entities/Order.js";

export const buildAddOrderUseCase = ({ orderRepository }) => {
  return async (payload) => {
    const order = createOrder(payload);
    // Thin orchestration: validate/build in domain, persistence in repository.
    return orderRepository.create(order);
  };
};
