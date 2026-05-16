import { createOrder } from "../../domain/entities/Order.js";
import { createOrderCancelledEvent } from "../../domain/events/index.js";
import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { toOrderReadModel } from "../read-models/orderReadModel.js";
import { ApplicationForbiddenError } from "../../../../shared/application/errors/index.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

const assertCanAccessOrder = ({ order, requesterId, requesterIsAdmin }) => {
  assertNonEmptyString(requesterId, "requesterId");
  if (!requesterIsAdmin && order.ownerId?.toString() !== requesterId.toString()) {
    throw new ApplicationForbiddenError("You can only delete your own orders");
  }
};

export const buildDeleteOrderUseCase =
  ({ orderRepository, orderEventPublisher, logger }) =>
  async ({ id, requesterId, requesterIsAdmin = false }) => {
    assertNonEmptyString(id, "id");

    const existing = await orderRepository.findById(id);
    if (!existing) throw new OrderNotFoundError(`Order ${id} not found`);
    assertCanAccessOrder({ order: existing, requesterId, requesterIsAdmin });

    await orderRepository.deleteById(id);

    const event = createOrderCancelledEvent(createOrder(existing));
    await orderEventPublisher.publish(event);

    logger?.info({ msg: "Order deleted", orderId: id });
    return toOrderReadModel(existing);
  };
