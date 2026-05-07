import test from "node:test";
import assert from "node:assert/strict";

import { DomainValidationError } from "../../../../../src/shared/domain/errors/index.js";
import { createEmail } from "../../../../../src/modules/auth/domain/value-objects/Email.js";
import { createMoney } from "../../../../../src/modules/orders/domain/value-objects/Money.js";
import {
  createOrderStatus,
  ORDER_STATUSES,
} from "../../../../../src/modules/orders/domain/value-objects/OrderStatus.js";
import {
  createPaymentStatus,
  PAYMENT_STATUSES,
} from "../../../../../src/shared/domain/value-objects/PaymentStatus.js";

test("createEmail normalizes valid emails", () => {
  const email = createEmail(" User@Example.COM ");

  assert.equal(email.value, "user@example.com");
  assert.equal(email.toPrimitives(), "user@example.com");
});

test("createEmail rejects invalid emails", () => {
  assert.throws(
    () => createEmail("not-an-email"),
    DomainValidationError
  );
});

test("createMoney normalizes currency and adds same-currency amounts", () => {
  const first = createMoney({ amount: 10.25, currency: "usd" });
  const second = createMoney({ amount: 2.1, currency: "USD" });

  assert.deepEqual(first.add(second).toPrimitives(), {
    amount: 12.35,
    currency: "USD",
  });
});

test("createMoney rejects unsupported currencies and cross-currency add", () => {
  assert.throws(
    () => createMoney({ amount: 10, currency: "JPY" }),
    DomainValidationError
  );

  assert.throws(
    () => createMoney({ amount: 10, currency: "USD" }).add(
      createMoney({ amount: 10, currency: "EUR" })
    ),
    DomainValidationError
  );
});

test("createOrderStatus validates transition graph", () => {
  const pending = createOrderStatus(ORDER_STATUSES.PENDING);
  const delivered = createOrderStatus(ORDER_STATUSES.DELIVERED);

  assert.equal(pending.canTransitionTo(ORDER_STATUSES.PROCESSING), true);
  assert.equal(pending.canTransitionTo(ORDER_STATUSES.DELIVERED), false);
  assert.equal(delivered.canTransitionTo(ORDER_STATUSES.CANCELLED), false);
});

test("createPaymentStatus normalizes valid values and rejects invalid values", () => {
  assert.equal(createPaymentStatus(" PAID ").value, PAYMENT_STATUSES.PAID);

  assert.throws(
    () => createPaymentStatus("unknown"),
    DomainValidationError
  );
});
