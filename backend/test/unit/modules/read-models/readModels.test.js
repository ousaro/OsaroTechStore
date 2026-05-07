import test from "node:test";
import assert from "node:assert/strict";

import { toCategoryReadModel } from "../../../../src/modules/categories/application/read-models/categoryReadModel.js";
import { toOrderReadModel } from "../../../../src/modules/orders/application/read-models/orderReadModel.js";
import { toPaymentReadModel } from "../../../../src/modules/payments/application/read-models/paymentReadModel.js";
import { toProductReadModel } from "../../../../src/modules/products/application/read-models/productReadModel.js";
import { toUserReadModel } from "../../../../src/modules/users/application/read-models/userReadModel.js";

test("read models return null for empty records", () => {
  assert.equal(toCategoryReadModel(null), null);
  assert.equal(toOrderReadModel(null), null);
  assert.equal(toPaymentReadModel(null), null);
  assert.equal(toProductReadModel(null), null);
  assert.equal(toUserReadModel(null), null);
});

test("order read model defaults missing collections and address", () => {
  assert.deepEqual(toOrderReadModel({ _id: "o1" }), {
    _id: "o1",
    ownerId: undefined,
    orderLines: [],
    deliveryAddress: {},
    currency: undefined,
    orderStatus: undefined,
    paymentStatus: undefined,
    totalPrice: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });
});
