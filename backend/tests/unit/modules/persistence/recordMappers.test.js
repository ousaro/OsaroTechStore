import test from "node:test";
import assert from "node:assert/strict";

import { toAuthUserRecord } from "../../../../src/modules/auth/adapters/output/persistence/mongo/authUserRecordMapper.js";
import { toCategoryRecord } from "../../../../src/modules/categories/adapters/output/persistence/mongo/categoryRecordMapper.js";
import { toOrderRecord } from "../../../../src/modules/orders/adapters/output/persistence/mongo/orderRecordMapper.js";
import { toPaymentRecord } from "../../../../src/modules/payments/adapters/output/persistence/mongo/paymentRecordMapper.js";
import { toProductRecord } from "../../../../src/modules/products/adapters/output/persistence/mongo/productRecordMapper.js";
import { toUserRecord } from "../../../../src/modules/users/adapters/output/persistence/mongo/userRecordMapper.js";

const objectIdLike = (value) => ({ toString: () => value });
const doc = (value) => ({ toObject: () => value });

test("record mappers return null for empty documents", () => {
  assert.equal(toAuthUserRecord(null), null);
  assert.equal(toCategoryRecord(null), null);
  assert.equal(toOrderRecord(null), null);
  assert.equal(toPaymentRecord(null), null);
  assert.equal(toProductRecord(null), null);
  assert.equal(toUserRecord(null), null);
});

test("auth and user record mappers normalize user-shaped documents", () => {
  const source = {
    _id: objectIdLike("u1"),
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    admin: true,
    favorites: ["p1"],
    cart: [],
  };

  assert.deepEqual(toAuthUserRecord(source), {
    _id: "u1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    admin: true,
    picture: undefined,
    phone: undefined,
    address: undefined,
    city: undefined,
    country: undefined,
    state: undefined,
    postalCode: undefined,
    favorites: ["p1"],
    cart: [],
  });
  assert.equal(toUserRecord(doc(source))._id, "u1");
  assert.equal(toUserRecord(doc(source)).email, "ada@example.com");
});

test("product and category record mappers normalize object ids", () => {
  const product = toProductRecord(
    doc({
      _id: objectIdLike("p1"),
      name: "Keyboard",
      price: 50,
      currency: "USD",
      category: objectIdLike("c1"),
      stock: 2,
      images: [],
      status: "active",
    })
  );
  const category = toCategoryRecord(
    doc({
      _id: objectIdLike("c1"),
      name: "Accessories",
      description: "Gear",
    })
  );

  assert.equal(product._id, "p1");
  assert.equal(product.category, "c1");
  assert.equal(category._id, "c1");
  assert.equal(category.name, "Accessories");
});

test("order record mapper preserves order lines and money fields", () => {
  const order = toOrderRecord(
    doc({
      _id: objectIdLike("o1"),
      ownerId: objectIdLike("u1"),
      orderLines: [
        {
          productId: "p1",
          name: "Keyboard",
          quantity: 2,
          unitPrice: { amount: 50, currency: "USD" },
          subtotal: { amount: 100, currency: "USD" },
        },
      ],
      deliveryAddress: { city: "Casablanca" },
      currency: "USD",
      orderStatus: "pending",
      paymentStatus: "pending",
      totalPrice: { amount: 100, currency: "USD" },
    })
  );

  assert.equal(order._id, "o1");
  assert.equal(order.ownerId, "u1");
  assert.deepEqual(order.orderLines[0].subtotal, { amount: 100, currency: "USD" });
});

test("payment record mapper normalizes ids and legacy payment status field", () => {
  const payment = toPaymentRecord(
    doc({
      _id: objectIdLike("pay1"),
      orderId: objectIdLike("o1"),
      provider: "stripe",
      workflowType: "checkout",
      payment_status: "paid",
      sessionId: "sess_1",
    })
  );

  assert.equal(payment._id, "pay1");
  assert.equal(payment.orderId, "o1");
  assert.equal(payment.paymentStatus, "paid");
});
