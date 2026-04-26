import { assertNonEmptyString, assertObject } from "../../../../shared/infrastructure/assertions";
import { assertEventOrderPlaced } from "./assertEventOrderPlaced";

export const createOrderPlacedEvent = (order) => {
  assertObject(order, "order")

  const orderId = order._id ?? order.id;

  assertNonEmptyString(orderId, "orderId")

  const event = Object.freeze({
    type: "OrderPlaced",
    payload: {
      orderId,
      ownerId: order.ownerId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference,
      totalPrice: order.totalPrice,
    },
  });

  return assertEventOrderPlaced(event, {expectedType: "OrderPlaced"})
};
