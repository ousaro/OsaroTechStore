import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { transitionOrderStatus } from "../entities/Order.js";
import { createPaymentStatus } from "../value-objects/PaymentStatus.js";

const ORDER_STATUSES_REQUIRING_PAID_PAYMENT = new Set([
  "paid",
  "processing",
  "shipped",
  "delivered",
]);

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
    patchUpdates.status = transitionOrderStatus(
      currentOrder,
      patchUpdates.status
    ).toPrimitives();
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
