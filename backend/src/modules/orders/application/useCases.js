/**
 * Orders Application Use Cases.
 *
 * Fixed:
 *  - handleOrderPlaced was an empty stub — removed. The OrderPlaced event
 *    is subscribed to by the payments module's translator instead.
 *  - confirmOrderPayment is now a proper use case, not inline composition code.
 *  - All use cases receive dependencies via closure (builder pattern).
 */

import { createOrder }              from "../../domain/entities/Order.js";
import { createOrderPlacedEvent, createOrderUpdatedEvent, createOrderCancelledEvent }
                                    from "../../domain/events/index.js";
import { applyPaymentOutcomeToOrder, assertOrderUpdateAllowed }
                                    from "../../domain/services/orderDomainServices.js";
import { OrderNotFoundError, OrderValidationError }
                                    from "../errors/OrderApplicationError.js";
import { assertNonEmptyString }     from "../../../../shared/kernel/assertions/index.js";
import { toOrderReadModel }         from "../read-models/orderReadModel.js";

// ── Commands ─────────────────────────────────────────────────────────────────

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

export const buildDeleteOrderUseCase = ({ orderRepository, orderEventPublisher, logger }) =>
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

export const buildConfirmOrderPaymentUseCase = ({ orderRepository, logger }) =>
  async ({ orderId, paymentStatus }) => {
    assertNonEmptyString(orderId,      "orderId");
    assertNonEmptyString(paymentStatus,"paymentStatus");

    const existing = await orderRepository.findById(orderId);
    if (!existing) throw new OrderNotFoundError(`Order ${orderId} not found`);

    const order   = createOrder(existing);
    const updated = applyPaymentOutcomeToOrder(order, paymentStatus);
    const saved   = await orderRepository.updateById(orderId, updated.toPrimitives());

    logger?.info({ msg: "Order payment confirmed", orderId, paymentStatus });
    return toOrderReadModel(saved);
  };

// ── Queries ──────────────────────────────────────────────────────────────────

export const buildGetAllOrdersUseCase = ({ orderRepository }) =>
  async ({ ownerId } = {}) => {
    const records = ownerId
      ? await orderRepository.findByOwnerId(ownerId)
      : await orderRepository.findAll();
    return records.map(toOrderReadModel);
  };

export const buildGetOrderByIdUseCase = ({ orderRepository }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");
    const record = await orderRepository.findById(id);
    if (!record) throw new OrderNotFoundError(`Order ${id} not found`);
    return toOrderReadModel(record);
  };
