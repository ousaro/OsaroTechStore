import { createOrder }              from "../../domain/entities/Order.js";
import { createOrderUpdatedEvent }  from "../../domain/events/index.js";
import { assertOrderUpdateAllowed } from "../../domain/services/orderDomainServices.js";
import { OrderNotFoundError }       from "../errors/OrderApplicationError.js";
import { toOrderReadModel }         from "../read-models/orderReadModel.js";
import { assertNonEmptyString }     from "../../../../shared/kernel/assertions/index.js";

export const buildUpdateOrderUseCase = ({ orderRepository, orderEventPublisher, logger }) =>
  async ({ id, updates }) => {
    assertNonEmptyString(id, "id");

    const existing = await orderRepository.findById(id);
    if (!existing) throw new OrderNotFoundError(`Order ${id} not found`);

    const order = createOrder(existing);
    assertOrderUpdateAllowed(order, updates);

    const updated     = order.update(updates);
    const savedRecord = await orderRepository.updateById(id, updated.toPrimitives());

    const event = createOrderUpdatedEvent(updated);
    await orderEventPublisher.publish(event);

    logger?.info({ msg: "Order updated", orderId: id });
    return toOrderReadModel(savedRecord);
  };
