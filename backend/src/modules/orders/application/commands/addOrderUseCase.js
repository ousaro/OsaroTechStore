import { createOrder }            from "../../domain/entities/Order.js";
import { createOrderPlacedEvent } from "../../domain/events/index.js";
import { toOrderReadModel }       from "../read-models/orderReadModel.js";
import { assertNonEmptyString }   from "../../../../shared/kernel/assertions/index.js";

export const buildAddOrderUseCase = ({ orderRepository, orderEventPublisher, logger }) =>
  async ({ ownerId, orderLines, deliveryAddress, currency }) => {
    assertNonEmptyString(ownerId, "ownerId");

    const order = createOrder({ ownerId, orderLines, deliveryAddress, currency });
    const saved = await orderRepository.create(order.toPrimitives());

    const event = createOrderPlacedEvent({ ...order, _id: saved._id });
    await orderEventPublisher.publish(event);

    logger?.info({ msg: "Order placed", orderId: saved._id, ownerId });
    return toOrderReadModel(saved);
  };
