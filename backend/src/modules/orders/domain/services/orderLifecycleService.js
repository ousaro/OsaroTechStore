import {
  cancelOrder,
  deliverOrder,
  markOrderAsPaid,
  shipOrder,
  startOrderProcessing,
  transitionOrderStatus,
} from "../entities/Order.js";
import { createPaymentStatus } from "../../../payments/domain/value-objects/PaymentStatus.js";
import { assertObject } from "../../../../shared/infrastructure/assertions";
import { OrderStatusRequiredPaymentStatusPaidError } from "../errors/OrderStatusRequiredPaymentStatusPaidError.js";


const ORDER_STATUSES_REQUIRING_PAID_PAYMENT = new Set([
  "paid",
  "processing",
  "shipped",
  "delivered",
]);

const ORDER_STATUS_BEHAVIORS = {
  paid: markOrderAsPaid,
  processing: startOrderProcessing,
  shipped: shipOrder,
  delivered: deliverOrder,
  cancelled: cancelOrder,
};

export const prepareOrderLifecyclePatch = ({ currentOrder, updates }) => {
  assertObject(currentOrder, "currentOrder")
  assertObject(updates, "updates")

  const patchUpdates = { ...updates };
  const nextPaymentStatus =
    patchUpdates.paymentStatus !== undefined
      ? createPaymentStatus(patchUpdates.paymentStatus).toPrimitives()
      : createPaymentStatus(currentOrder.paymentStatus ?? "pending").toPrimitives();

  if (patchUpdates.status !== undefined) {
    const requestedStatus = transitionOrderStatus(
      currentOrder,
      patchUpdates.status
    ).toPrimitives();
    const applyStatusBehavior =
      ORDER_STATUS_BEHAVIORS[requestedStatus] ??
      ((order) => transitionOrderStatus(order, requestedStatus));

    patchUpdates.status = applyStatusBehavior(currentOrder).toPrimitives();
  }

  const effectiveOrderStatus = patchUpdates.status ?? currentOrder.status;

  if (
    ORDER_STATUSES_REQUIRING_PAID_PAYMENT.has(effectiveOrderStatus) &&
    nextPaymentStatus !== "paid"
  ) {
    throw new OrderStatusRequiredPaymentStatusPaidError(
      `Order status ${effectiveOrderStatus} requires paymentStatus paid`
    );
  }

  if (patchUpdates.paymentStatus !== undefined) {
    patchUpdates.paymentStatus = nextPaymentStatus;
  }

  return patchUpdates;
};
