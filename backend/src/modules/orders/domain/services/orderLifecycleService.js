import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import {
  cancelOrder,
  deliverOrder,
  markOrderAsPaid,
  shipOrder,
  startOrderProcessing,
  transitionOrderStatus,
} from "../entities/Order.js";
import { createPaymentStatus } from "../value-objects/PaymentStatus.js";

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
  if (!currentOrder || typeof currentOrder !== "object") {
    throw new Error("currentOrder is required");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("updates are required");
  }

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
    throw new DomainValidationError(
      `Order status ${effectiveOrderStatus} requires paymentStatus paid`
    );
  }

  if (patchUpdates.paymentStatus !== undefined) {
    patchUpdates.paymentStatus = nextPaymentStatus;
  }

  return patchUpdates;
};
