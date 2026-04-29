/**
 * Order Domain Events.
 * All events use the shared createDomainEvent envelope (id, type, occurredAt, version).
 */
import { createDomainEvent } from "../../../../shared/domain/events/createDomainEvent.js";

export const createOrderPlacedEvent = (order) =>
  createDomainEvent("OrderPlaced", {
    orderId:       order._id,
    ownerId:       order.ownerId,
    orderLines:    order.orderLines.map((l) => l.toPrimitives()),
    totalPrice:    order.totalPrice.toPrimitives(),
    currency:      order.currency,
  });

export const createOrderUpdatedEvent = (order) =>
  createDomainEvent("OrderUpdated", {
    orderId:      order._id,
    orderStatus:  order.orderStatus.toPrimitives(),
    paymentStatus: order.paymentStatus.toPrimitives(),
  });

export const createOrderCancelledEvent = (order) =>
  createDomainEvent("OrderCancelled", {
    orderId:  order._id,
    ownerId:  order.ownerId,
    currency: order.currency,
  });
