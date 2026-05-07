import { createOrder } from "../../domain/entities/Order.js";
import { createOrderCancelledEvent } from "../../domain/events/index.js";
import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { toOrderReadModel } from "../read-models/orderReadModel.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const buildDeleteOrderUseCase =
  ({ orderRepository, orderEventPublisher, logger }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");

    const existing = await orderRepository.findById(id);
    if (!existing) throw new OrderNotFoundError(`Order ${id} not found`);

    await orderRepository.deleteById(id);

    const event = createOrderCancelledEvent(createOrder(existing));
    await orderEventPublisher.publish(event);

    logger?.info({ msg: "Order deleted", orderId: id });
    return toOrderReadModel(existing);
  };
