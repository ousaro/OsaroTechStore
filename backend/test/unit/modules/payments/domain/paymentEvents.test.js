import test from "node:test";
import assert from "node:assert/strict";

import {
  createPaymentConfirmedEvent,
  createPaymentExpiredEvent,
  createPaymentFailedEvent,
  createPaymentStateChangedEvent,
} from "../../../../../src/modules/payments/domain/events/index.js";
import { createPaymentWorkflow } from "../../../../../src/modules/payments/domain/entities/PaymentWorkflow.js";

const payment = {
  _id: "pay1",
  orderId: "o1",
  provider: "stripe",
};

test("payment terminal event helpers create typed events", () => {
  assert.equal(createPaymentConfirmedEvent(payment).type, "PaymentConfirmed");
  assert.equal(createPaymentFailedEvent(payment).type, "PaymentFailed");
  assert.equal(createPaymentExpiredEvent(payment).type, "PaymentExpired");
});

test("payment state changed event falls back for non-terminal status", () => {
  const pendingPayment = createPaymentWorkflow({
    _id: "pay1",
    orderId: "o1",
    provider: "stripe",
    workflowType: "checkout",
    paymentStatus: "pending",
  });

  const event = createPaymentStateChangedEvent(pendingPayment);

  assert.equal(event.type, "PaymentStateChanged");
  assert.equal(event.payload.paymentStatus, "pending");
});
