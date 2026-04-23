import { createOrder } from "../../domain/entities/Order.js";
import { createOrderPlacedEvent } from "../../domain/events/OrderPlaced.js";
import { assertOrderEventPublisherPort } from "../../ports/output/orderEventPublisherPort.js";
import { assertOrderRepositoryCommandPort } from "../../ports/output/orderRepositoryPort.js";
import { toOrderReadModel } from "../read-models/orderReadModel.js";

export const buildAddOrderUseCase = ({
  orderRepository,
  orderEventPublisher = null,
}) => {
  assertOrderRepositoryCommandPort(orderRepository, ["create"]);
  if (orderEventPublisher) {
    assertOrderEventPublisherPort(orderEventPublisher, ["publish"]);
  }

  return async (payload) => {
    const paymentReference =
      payload.paymentReference ??
      payload.paymentDetails?.paymentReference ??
      payload.transactionId ??
      payload.paymentDetails?.payment_intent ??
      payload.paymentDetails?.id;
    const normalizedPayload = {
      ...payload,
      paymentReference,
      transactionId: paymentReference,
    };
    const order = createOrder(normalizedPayload);
    // Thin orchestration: validate/build in domain, persistence in repository.
    const createdOrder = await orderRepository.create(order);

    if (orderEventPublisher) {
      await orderEventPublisher.publish(createOrderPlacedEvent(createdOrder));
    }

    return toOrderReadModel(createdOrder);
  };
};
