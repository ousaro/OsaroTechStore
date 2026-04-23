const assertNonEmptyString = (value, fieldName) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} is required`);
  }
};

const assertObject = (value, fieldName) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fieldName} must be an object`);
  }
};

const EVENT_PAYLOAD_ASSERTIONS = {
  CategoryDeleted(payload) {
    assertObject(payload, "event.payload");
    assertNonEmptyString(payload.categoryId, "event.payload.categoryId");
    assertNonEmptyString(payload.name, "event.payload.name");
  },
  OrderPlaced(payload) {
    assertObject(payload, "event.payload");
    assertNonEmptyString(payload.orderId, "event.payload.orderId");
    assertNonEmptyString(payload.ownerId, "event.payload.ownerId");
    assertNonEmptyString(payload.status, "event.payload.status");
    assertNonEmptyString(payload.paymentStatus, "event.payload.paymentStatus");
    assertNonEmptyString(payload.paymentReference, "event.payload.paymentReference");
    if (typeof payload.totalPrice !== "number") {
      throw new Error("event.payload.totalPrice is required");
    }
  },
  PaymentConfirmed(payload) {
    assertObject(payload, "event.payload");
    assertNonEmptyString(payload.paymentReference, "event.payload.paymentReference");
    assertNonEmptyString(payload.sessionId, "event.payload.sessionId");
    assertNonEmptyString(payload.eventId, "event.payload.eventId");
    if (payload.paymentStatus !== "paid") {
      throw new Error("event.payload.paymentStatus must be paid");
    }
  },
  PaymentFailed(payload) {
    assertObject(payload, "event.payload");
    assertNonEmptyString(payload.paymentReference, "event.payload.paymentReference");
    assertNonEmptyString(payload.sessionId, "event.payload.sessionId");
    assertNonEmptyString(payload.eventId, "event.payload.eventId");
    if (payload.paymentStatus !== "failed") {
      throw new Error("event.payload.paymentStatus must be failed");
    }
  },
  PaymentExpired(payload) {
    assertObject(payload, "event.payload");
    assertNonEmptyString(payload.paymentReference, "event.payload.paymentReference");
    assertNonEmptyString(payload.sessionId, "event.payload.sessionId");
    assertNonEmptyString(payload.eventId, "event.payload.eventId");
    if (payload.paymentStatus !== "failed") {
      throw new Error("event.payload.paymentStatus must be failed");
    }
  },
  PaymentRefunded(payload) {
    assertObject(payload, "event.payload");
    assertNonEmptyString(payload.paymentReference, "event.payload.paymentReference");
    assertNonEmptyString(payload.sessionId, "event.payload.sessionId");
    assertNonEmptyString(payload.eventId, "event.payload.eventId");
    if (payload.paymentStatus !== "refunded") {
      throw new Error("event.payload.paymentStatus must be refunded");
    }
  },
};

export const assertApplicationEvent = (event, { expectedType } = {}) => {
  assertObject(event, "event");
  assertNonEmptyString(event.type, "event.type");

  if (expectedType && event.type !== expectedType) {
    throw new Error(`event.type must be ${expectedType}`);
  }

  const payloadAssertion = EVENT_PAYLOAD_ASSERTIONS[event.type];

  if (payloadAssertion) {
    payloadAssertion(event.payload);
  }

  return event;
};
