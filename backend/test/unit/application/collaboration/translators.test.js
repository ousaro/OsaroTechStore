import test from "node:test";
import assert from "node:assert/strict";

import { createDomainEvent } from "../../../../src/shared/domain/events/createDomainEvent.js";
import { PAYMENT_STATUSES } from "../../../../src/shared/domain/value-objects/PaymentStatus.js";
import { createOrderPlacedPaymentLinkTranslator } from "../../../../src/modules/payments/adapters/input/collaboration/orderPlacedPaymentLinkTranslator.js";
import { createCategoryDeletedProductCleanupTranslator } from "../../../../src/modules/categories/adapters/input/collaboration/categoryDeletedProductCleanupTranslator.js";
import { createPaymentConfirmedOrderSyncTranslator } from "../../../../src/modules/orders/adapters/input/collaboration/paymentConfirmedOrderSyncTranslator.js";

test("OrderPlaced payment link translator calls payment use case with order payload", async () => {
  const calls = [];
  const translator = createOrderPlacedPaymentLinkTranslator({
    linkPaymentToOrder: async (payload) => calls.push(payload),
  });
  const event = createDomainEvent("OrderPlaced", {
    orderId: "o1",
    orderLines: [{ productId: "p1" }],
    currency: "USD",
  });

  await translator.publish(event);

  assert.deepEqual(calls[0], {
    orderId: "o1",
    orderLines: [{ productId: "p1" }],
    currency: "USD",
  });
});

test("CategoryDeleted cleanup translator calls product cleanup when categoryId exists", async () => {
  const calls = [];
  const translator = createCategoryDeletedProductCleanupTranslator({
    removeProductsByCategory: async (payload) => calls.push(payload),
  });

  await translator.publish(createDomainEvent("CategoryDeleted", { categoryId: "c1" }));
  await translator.publish(createDomainEvent("CategoryDeleted", {}));

  assert.deepEqual(calls, [{ categoryId: "c1" }]);
});

test("Payment event translator maps terminal payment events to order payment statuses", async () => {
  const calls = [];
  const translator = createPaymentConfirmedOrderSyncTranslator({
    confirmOrderPayment: async (payload) => calls.push(payload),
  });

  await translator.publish(createDomainEvent("PaymentConfirmed", { orderId: "o1" }));
  await translator.publish(createDomainEvent("PaymentFailed", { orderId: "o2" }));
  await translator.publish(createDomainEvent("PaymentExpired", { orderId: "o3" }));
  await translator.publish(createDomainEvent("PaymentStateChanged", { orderId: "o4" }));

  assert.deepEqual(calls, [
    { orderId: "o1", paymentStatus: PAYMENT_STATUSES.PAID },
    { orderId: "o2", paymentStatus: PAYMENT_STATUSES.FAILED },
    { orderId: "o3", paymentStatus: PAYMENT_STATUSES.EXPIRED },
  ]);
});

test("translators validate expected event types", async () => {
  const translator = createOrderPlacedPaymentLinkTranslator({
    linkPaymentToOrder: async () => {},
  });

  await assert.rejects(
    () => translator.publish(createDomainEvent("WrongEvent", { orderId: "o1" }))
  );
});
