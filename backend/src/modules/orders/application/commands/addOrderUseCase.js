import { createOrder } from "../../domain/entities/Order.js";
import { createOrderPlacedEvent } from "../../domain/events/OrderPlaced.js";
import { assertOrderEventPublisherPort } from "../../ports/output/orderEventPublisherPort.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildAddOrderUseCase = ({
  orderRepository,
  orderEventPublisher = null,
}) => {
  assertOrderRepositoryPort(orderRepository, ["create"]);
  if (orderEventPublisher) {
    assertOrderEventPublisherPort(orderEventPublisher, ["publish"]);
  }

  return async (payload) => {
    const order = createOrder(payload);
    // Thin orchestration: validate/build in domain, persistence in repository.
    const createdOrder = await orderRepository.create(order);

    if (orderEventPublisher) {
      await orderEventPublisher.publish(createOrderPlacedEvent(createdOrder));
    }

    return createdOrder;
  };
};
