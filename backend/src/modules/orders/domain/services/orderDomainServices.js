import { ORDER_STATUSES } from "../value-objects/OrderStatus.js";
import { PAYMENT_STATUSES } from "../../../../shared/domain/value-objects/PaymentStatus.js";
import { OrderStatusTransitionNotAllowedError } from "../errors/index.js";

export const applyPaymentOutcomeToOrder = (order, newPaymentStatus) => {
  const updatedOrder = order.confirmPayment(newPaymentStatus);

  if (newPaymentStatus === PAYMENT_STATUSES.PAID) {
    return updatedOrder.updateStatus(ORDER_STATUSES.PROCESSING);
  }

  if (
    newPaymentStatus === PAYMENT_STATUSES.FAILED ||
    newPaymentStatus === PAYMENT_STATUSES.EXPIRED
  ) {
    if (!updatedOrder.orderStatus.canTransitionTo(ORDER_STATUSES.CANCELLED)) {
      throw new OrderStatusTransitionNotAllowedError(
        `Cannot cancel order with status "${updatedOrder.orderStatus.value}"`
      );
    }
    return updatedOrder.updateStatus(ORDER_STATUSES.CANCELLED);
  }

  return updatedOrder;
};

export const assertOrderUpdateAllowed = (order, updates) => {
  const isPlaced = order.orderStatus.value !== ORDER_STATUSES.PENDING;

  if (isPlaced && (updates.orderLines || updates.ownerId || updates.currency)) {
    throw new OrderStatusTransitionNotAllowedError(
      "Core order fields cannot be changed after the order is placed"
    );
  }
};
