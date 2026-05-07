import test from "node:test";
import assert from "node:assert/strict";

import { DomainValidationError } from "../../../src/shared/domain/errors/index.js";
import {
  createProduct,
  PRODUCT_STATUSES,
} from "../../../src/modules/products/domain/entities/Product.js";
import { createOrder } from "../../../src/modules/orders/domain/entities/Order.js";
import { ORDER_STATUSES } from "../../../src/modules/orders/domain/value-objects/OrderStatus.js";
import { PAYMENT_STATUSES } from "../../../src/shared/domain/value-objects/PaymentStatus.js";
import {
  ImmutableFieldsAfterOrderPlacementError,
  OrderStatusTransitionNotAllowedError,
} from "../../../src/modules/orders/domain/errors/index.js";

const validOrderInput = {
  _id: "o1",
  ownerId: "u1",
  currency: "USD",
  orderLines: [
    {
      productId: "p1",
      name: "Keyboard",
      price: 49.99,
      quantity: 2,
    },
    {
      productId: "p2",
      name: "Mouse",
      price: 25,
      quantity: 1,
    },
  ],
  deliveryAddress: {
    street: "1 Main St",
    city: "Casablanca",
    country: "MA",
  },
};

test("createProduct applies defaults and returns primitives", () => {
  const product = createProduct({
    _id: "p1",
    name: "Keyboard",
    price: 49.99,
    category: "accessories",
  });

  assert.equal(product.status, PRODUCT_STATUSES.NEW);
  assert.deepEqual(product.toPrimitives(), {
    _id: "p1",
    name: "Keyboard",
    description: undefined,
    price: 49.99,
    currency: "USD",
    category: "accessories",
    stock: 0,
    images: [],
    status: PRODUCT_STATUSES.NEW,
  });
});

test("createProduct rejects invalid status", () => {
  assert.throws(
    () => createProduct({
      name: "Keyboard",
      price: 49.99,
      category: "accessories",
      status: "archived",
    }),
    DomainValidationError
  );
});

test("createOrder computes totals and primitives", () => {
  const order = createOrder(validOrderInput);

  assert.deepEqual(order.totalPrice.toPrimitives(), {
    amount: 124.98,
    currency: "USD",
  });
  assert.equal(order.toPrimitives().orderStatus, ORDER_STATUSES.PENDING);
  assert.equal(order.toPrimitives().paymentStatus, PAYMENT_STATUSES.PENDING);
});

test("createOrder enforces allowed status transitions", () => {
  const processing = createOrder(validOrderInput).updateStatus(ORDER_STATUSES.PROCESSING);

  assert.equal(processing.orderStatus.value, ORDER_STATUSES.PROCESSING);
  assert.throws(
    () => processing.updateStatus(ORDER_STATUSES.DELIVERED),
    OrderStatusTransitionNotAllowedError
  );
});

test("createOrder prevents immutable updates after placement", () => {
  const processing = createOrder(validOrderInput).updateStatus(ORDER_STATUSES.PROCESSING);

  assert.throws(
    () => processing.update({ ownerId: "u2" }),
    ImmutableFieldsAfterOrderPlacementError
  );
});

test("createOrder can confirm payment status", () => {
  const paid = createOrder(validOrderInput).confirmPayment(PAYMENT_STATUSES.PAID);

  assert.equal(paid.paymentStatus.value, PAYMENT_STATUSES.PAID);
});
