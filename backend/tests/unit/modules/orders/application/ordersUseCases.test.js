import test from "node:test";
import assert from "node:assert/strict";

import { buildAddOrderUseCase } from "../../../../../src/modules/orders/application/commands/addOrderUseCase.js";
import { buildConfirmOrderPaymentUseCase } from "../../../../../src/modules/orders/application/commands/confirmOrderPaymentUseCase.js";
import { OrderNotFoundError } from "../../../../../src/modules/orders/application/errors/OrderApplicationError.js";
import { PAYMENT_STATUSES } from "../../../../../src/shared/domain/value-objects/PaymentStatus.js";

const orderInput = {
  ownerId: "u1",
  currency: "USD",
  orderLines: [
    {
      productId: "p1",
      name: "Keyboard",
      price: 50,
      quantity: 2,
    },
  ],
  deliveryAddress: {
    street: "1 Main St",
    city: "Casablanca",
    country: "MA",
  },
};

const createPublisher = () => {
  const events = [];
  return {
    events,
    publish: async (event) => events.push(event),
  };
};

const createLogger = () => {
  const entries = [];
  return {
    entries,
    info: (entry) => entries.push(entry),
  };
};

test("addOrder persists computed order, publishes OrderPlaced, logs, and returns read model", async () => {
  const publisher = createPublisher();
  const logger = createLogger();
  const orderRepository = {
    create: async (record) => ({ ...record, _id: "o1" }),
  };
  const addOrder = buildAddOrderUseCase({
    orderRepository,
    orderEventPublisher: publisher,
    logger,
  });

  const result = await addOrder(orderInput);

  assert.equal(result._id, "o1");
  assert.deepEqual(result.totalPrice, { amount: 100, currency: "USD" });
  assert.equal(publisher.events[0].type, "OrderPlaced");
  assert.deepEqual(publisher.events[0].payload.totalPrice, {
    amount: 100,
    currency: "USD",
  });
  assert.deepEqual(logger.entries[0], {
    msg: "Order placed",
    orderId: "o1",
    ownerId: "u1",
  });
});

test("confirmOrderPayment updates payment outcome and logs", async () => {
  const savedUpdates = [];
  const logger = createLogger();
  const existing = {
    _id: "o1",
    ...orderInput,
    orderStatus: "pending",
    paymentStatus: "pending",
  };
  const confirmPayment = buildConfirmOrderPaymentUseCase({
    orderRepository: {
      findById: async () => existing,
      updateById: async (id, record) => {
        savedUpdates.push({ id, record });
        return { ...record, _id: id };
      },
    },
    logger,
  });

  const result = await confirmPayment({
    orderId: "o1",
    paymentStatus: PAYMENT_STATUSES.PAID,
  });

  assert.equal(savedUpdates[0].id, "o1");
  assert.equal(savedUpdates[0].record.paymentStatus, PAYMENT_STATUSES.PAID);
  assert.equal(result.paymentStatus, PAYMENT_STATUSES.PAID);
  assert.deepEqual(logger.entries[0], {
    msg: "Order payment confirmed",
    orderId: "o1",
    paymentStatus: PAYMENT_STATUSES.PAID,
  });
});

test("confirmOrderPayment throws OrderNotFoundError when order is missing", async () => {
  const confirmPayment = buildConfirmOrderPaymentUseCase({
    orderRepository: {
      findById: async () => null,
      updateById: async () => {
        throw new Error("should not update");
      },
    },
    logger: createLogger(),
  });

  await assert.rejects(
    () => confirmPayment({ orderId: "missing", paymentStatus: PAYMENT_STATUSES.PAID }),
    OrderNotFoundError
  );
});
