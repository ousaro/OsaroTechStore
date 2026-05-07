import test from "node:test";
import assert from "node:assert/strict";

import { createOrder } from "../../../../../src/modules/orders/domain/entities/Order.js";
import { ORDER_STATUSES } from "../../../../../src/modules/orders/domain/value-objects/OrderStatus.js";
import {
  assertOrderUpdateAllowed,
  applyPaymentOutcomeToOrder,
} from "../../../../../src/modules/orders/domain/services/orderDomainServices.js";
import { OrderStatusTransitionNotAllowedError } from "../../../../../src/modules/orders/domain/errors/index.js";
import { PAYMENT_STATUSES } from "../../../../../src/shared/domain/value-objects/PaymentStatus.js";

const orderInput = {
  _id: "o1",
  ownerId: "u1",
  currency: "USD",
  orderLines: [{ productId: "p1", name: "Keyboard", price: 50, quantity: 1 }],
  deliveryAddress: { street: "1 Main", city: "Casa", country: "MA" },
};

test("applyPaymentOutcomeToOrder advances paid orders to processing", () => {
  const order = createOrder(orderInput);
  const updated = applyPaymentOutcomeToOrder(order, PAYMENT_STATUSES.PAID);

  assert.equal(updated.paymentStatus.value, PAYMENT_STATUSES.PAID);
  assert.equal(updated.orderStatus.value, ORDER_STATUSES.PROCESSING);
});

test("applyPaymentOutcomeToOrder cancels failed and expired orders", () => {
  assert.equal(
    applyPaymentOutcomeToOrder(createOrder(orderInput), PAYMENT_STATUSES.FAILED).orderStatus.value,
    ORDER_STATUSES.CANCELLED
  );
  assert.equal(
    applyPaymentOutcomeToOrder(createOrder(orderInput), PAYMENT_STATUSES.EXPIRED).orderStatus.value,
    ORDER_STATUSES.CANCELLED
  );
});

test("applyPaymentOutcomeToOrder rejects cancellation when current status cannot cancel", () => {
  const shipped = createOrder(orderInput)
    .updateStatus(ORDER_STATUSES.PROCESSING)
    .updateStatus(ORDER_STATUSES.SHIPPED);

  assert.throws(
    () => applyPaymentOutcomeToOrder(shipped, PAYMENT_STATUSES.FAILED),
    OrderStatusTransitionNotAllowedError
  );
});

test("assertOrderUpdateAllowed allows pending updates and rejects placed core updates", () => {
  assert.doesNotThrow(() =>
    assertOrderUpdateAllowed(createOrder(orderInput), { ownerId: "u2" })
  );

  const processing = createOrder(orderInput).updateStatus(ORDER_STATUSES.PROCESSING);
  assert.throws(
    () => assertOrderUpdateAllowed(processing, { currency: "EUR" }),
    OrderStatusTransitionNotAllowedError
  );
});
