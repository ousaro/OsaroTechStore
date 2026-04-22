import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export const createOrderPlacedEvent = (order) => {
  if (!order || typeof order !== "object") {
    throw new DomainValidationError("order is required to create OrderPlaced");
  }

  const orderId = order._id ?? order.id;

  if (typeof orderId !== "string" || orderId.trim() === "") {
    throw new DomainValidationError("order id is required to create OrderPlaced");
  }

  return Object.freeze({
    type: "OrderPlaced",
    payload: {
      orderId,
      ownerId: order.ownerId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalPrice: order.totalPrice,
    },
  });
};
