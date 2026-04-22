import { createOrder } from "../../domain/entities/Order.js";
import { createOrderPlacedEvent } from "../../domain/events/OrderPlaced.js";
import { assertOrderEventPublisherPort } from "../../ports/output/orderEventPublisherPort.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

export const buildAddOrderUseCase = ({
  orderRepository,
  linkPaymentToOrder = null,
  orderEventPublisher = null,
}) => {
  assertOrderRepositoryPort(orderRepository, ["create"]);
  if (linkPaymentToOrder && typeof linkPaymentToOrder !== "function") {
    throw new Error("linkPaymentToOrder must be a function");
  }
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

    if (linkPaymentToOrder && createdOrder.paymentReference) {
      await linkPaymentToOrder({
        paymentReference: createdOrder.paymentReference,
        orderId: createdOrder._id ?? createdOrder.id,
      });
    }

    if (orderEventPublisher) {
      await orderEventPublisher.publish(createOrderPlacedEvent(createdOrder));
    }

    return createdOrder;
  };
};
