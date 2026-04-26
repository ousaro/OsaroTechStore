import { assertObject, assertNonEmptyString, assertNumber } from "../../../../shared/infrastructure/assertions";
import { OrderPlacedEventNotMatched } from "../errors/OrderPlacedEventNotMatched";
export const assertEventOrderPlaced = (event, { expectedType } = {}) => {
    assertObject(event, "event");
    assertNonEmptyString(event.type, "event.type");

    if (expectedType && event.type !== expectedType) {
        throw new OrderPlacedEventNotMatched(`event.type must be ${expectedType}`);
    }

    assertObject(payload, "event.payload");
    assertNonEmptyString(payload.orderId, "event.payload.orderId");
    assertNonEmptyString(payload.ownerId, "event.payload.ownerId");
    assertNonEmptyString(payload.status, "event.payload.status");
    assertNonEmptyString(payload.paymentStatus, "event.payload.paymentStatus");
    assertNonEmptyString(payload.paymentReference, "event.payload.paymentReference");
    assertNumber(payload.totalPrice, "event.payload.totalPrice")

  return event;
};
