import test from "node:test";
import assert from "node:assert/strict";

import {
  createOrderCancelledEvent,
  createOrderUpdatedEvent,
} from "../../../../../src/modules/orders/domain/events/index.js";

const order = {
  _id: "o1",
  ownerId: "u1",
  currency: "USD",
  orderStatus: { toPrimitives: () => "processing" },
  paymentStatus: { toPrimitives: () => "paid" },
};

test("order updated event includes status payload", () => {
  const event = createOrderUpdatedEvent(order);

  assert.equal(event.type, "OrderUpdated");
  assert.deepEqual(event.payload, {
    orderId: "o1",
    orderStatus: "processing",
    paymentStatus: "paid",
  });
});

test("order cancelled event includes order owner and currency", () => {
  const event = createOrderCancelledEvent(order);

  assert.equal(event.type, "OrderCancelled");
  assert.deepEqual(event.payload, {
    orderId: "o1",
    ownerId: "u1",
    currency: "USD",
  });
});
