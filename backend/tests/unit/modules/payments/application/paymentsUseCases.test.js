import test from "node:test";
import assert from "node:assert/strict";

import { PAYMENT_STATUSES } from "../../../../../src/shared/domain/value-objects/PaymentStatus.js";
import { createPaymentWorkflow } from "../../../../../src/modules/payments/domain/entities/PaymentWorkflow.js";
import {
  applyWebhookStateChange,
  shouldPublishPaymentEvent,
} from "../../../../../src/modules/payments/domain/services/paymentWorkflowService.js";
import { createPaymentStateChangedEvent } from "../../../../../src/modules/payments/domain/events/index.js";
import { buildCreatePaymentIntentUseCase } from "../../../../../src/modules/payments/application/commands/createPaymentIntentUseCase.js";
import { buildLinkPaymentToOrderUseCase } from "../../../../../src/modules/payments/application/commands/linkPaymentToOrderUseCase.js";
import { buildVerifyWebhookUseCase } from "../../../../../src/modules/payments/application/commands/verifyWebhookUseCase.js";
import { buildGetPaymentByOrderIdUseCase } from "../../../../../src/modules/payments/application/queries/getPaymentByOrderIdUseCase.js";
import {
  PaymentNotFoundError,
  PaymentsDisabledError,
} from "../../../../../src/modules/payments/application/errors/PaymentApplicationError.js";

const session = {
  id: "sess_1",
  provider: "stripe",
  workflowType: "checkout",
  url: "https://pay.test/session",
};

const createLogger = () => {
  const entries = [];
  return {
    entries,
    info: (entry) => entries.push(entry),
    warn: (entry) => entries.push(entry),
    debug: (entry) => entries.push(entry),
  };
};

test("payment workflow applies webhook state changes", () => {
  const workflow = createPaymentWorkflow({
    _id: "pay1",
    orderId: "o1",
    provider: "stripe",
    workflowType: "checkout",
    sessionId: "sess_1",
  });

  const updated = applyWebhookStateChange(workflow, {
    paymentStatus: PAYMENT_STATUSES.PAID,
    providerPaymentId: "pi_1",
    providerStatus: "complete",
  });

  assert.equal(updated.paymentStatus.value, PAYMENT_STATUSES.PAID);
  assert.equal(updated.providerPaymentId, "pi_1");
  assert.equal(updated.providerStatus, "complete");
});

test("payment workflow service publishes only terminal event statuses", () => {
  assert.equal(shouldPublishPaymentEvent(PAYMENT_STATUSES.PAID), true);
  assert.equal(shouldPublishPaymentEvent(PAYMENT_STATUSES.FAILED), true);
  assert.equal(shouldPublishPaymentEvent(PAYMENT_STATUSES.EXPIRED), true);
  assert.equal(shouldPublishPaymentEvent(PAYMENT_STATUSES.PENDING), false);
});

test("payment state changed event maps payment status to event type", () => {
  const payment = createPaymentWorkflow({
    _id: "pay1",
    orderId: "o1",
    provider: "stripe",
    workflowType: "checkout",
    paymentStatus: PAYMENT_STATUSES.FAILED,
  });

  const event = createPaymentStateChangedEvent(payment);

  assert.equal(event.type, "PaymentFailed");
  assert.equal(event.payload.paymentStatus, PAYMENT_STATUSES.FAILED);
});

test("createPaymentIntent creates gateway session and persists workflow", async () => {
  const created = [];
  const logger = createLogger();
  const createPaymentIntent = buildCreatePaymentIntentUseCase({
    paymentsEnabled: true,
    clientUrl: "http://localhost:3000",
    paymentGateway: {
      createRedirectPayment: async (payload) => {
        assert.equal(payload.successUrl, "http://localhost:3000/payment-success?orderId=o1");
        assert.equal(payload.cancelUrl, "http://localhost:3000/payment-cancelled?orderId=o1");
        return session;
      },
    },
    paymentRepository: {
      create: async (record) => {
        created.push(record);
        return { ...record, _id: "pay1" };
      },
    },
    logger,
  });

  const result = await createPaymentIntent({
    orderId: "o1",
    items: [{ name: "Keyboard", price: 50, quantity: 1 }],
    currency: "USD",
  });

  assert.equal(created[0].orderId, "o1");
  assert.equal(created[0].sessionId, "sess_1");
  assert.equal(result._id, "pay1");
  assert.deepEqual(logger.entries[0], {
    msg: "Payment intent created",
    orderId: "o1",
    sessionId: "sess_1",
  });
});

test("createPaymentIntent throws when payments are disabled", async () => {
  const createPaymentIntent = buildCreatePaymentIntentUseCase({
    paymentsEnabled: false,
    clientUrl: "http://localhost:3000",
    paymentGateway: {},
    paymentRepository: {},
    logger: createLogger(),
  });

  await assert.rejects(
    () => createPaymentIntent({ orderId: "o1", items: [], currency: "USD" }),
    PaymentsDisabledError
  );
});

test("linkPaymentToOrder returns null when payments are disabled", async () => {
  const linkPaymentToOrder = buildLinkPaymentToOrderUseCase({
    paymentsEnabled: false,
    clientUrl: "http://localhost:3000",
    paymentGateway: {},
    paymentRepository: {},
    logger: createLogger(),
  });

  assert.equal(await linkPaymentToOrder({ orderId: "o1", orderLines: [], currency: "USD" }), null);
});

test("linkPaymentToOrder creates payment session and persists workflow when enabled", async () => {
  const created = [];
  const logger = createLogger();
  const linkPaymentToOrder = buildLinkPaymentToOrderUseCase({
    paymentsEnabled: true,
    clientUrl: "http://localhost:3000",
    paymentGateway: {
      createRedirectPayment: async (payload) => {
        assert.deepEqual(payload.items, [
          { name: "Keyboard", price: 50, quantity: 2 },
          { name: "Mouse", price: 20, quantity: 1 },
        ]);
        assert.equal(payload.successUrl, "http://localhost:3000/payment-success?orderId=o1");
        assert.equal(payload.cancelUrl, "http://localhost:3000/payment-cancelled?orderId=o1");
        return session;
      },
    },
    paymentRepository: {
      create: async (record) => {
        created.push(record);
        return { ...record, _id: "pay1" };
      },
    },
    logger,
  });

  const result = await linkPaymentToOrder({
    orderId: "o1",
    currency: "USD",
    orderLines: [
      { name: "Keyboard", unitPrice: { amount: 50 }, quantity: 2 },
      { name: "Mouse", price: 20, quantity: 1 },
    ],
  });

  assert.equal(created[0].orderId, "o1");
  assert.equal(created[0].sessionId, "sess_1");
  assert.equal(result._id, "pay1");
  assert.deepEqual(logger.entries[0], {
    msg: "Payment linked to order",
    orderId: "o1",
    sessionId: "sess_1",
  });
});

test("verifyWebhook updates existing payment and publishes terminal event", async () => {
  const published = [];
  const logger = createLogger();
  const existing = {
    _id: "pay1",
    orderId: "o1",
    provider: "stripe",
    workflowType: "checkout",
    paymentStatus: "pending",
    sessionId: "sess_1",
  };
  const verifyWebhook = buildVerifyWebhookUseCase({
    webhookEnabled: true,
    paymentGateway: {
      verifyWebhook: () => ({
        sessionId: "sess_1",
        paymentStatus: PAYMENT_STATUSES.PAID,
        providerPaymentId: "pi_1",
        providerStatus: "complete",
      }),
    },
    paymentRepository: {
      findBySessionId: async () => existing,
      updateById: async (id, record) => ({ ...record, _id: id }),
    },
    paymentEventPublisher: {
      publish: async (event) => published.push(event),
    },
    logger,
  });

  const result = await verifyWebhook({ rawBody: "{}", signature: "sig" });

  assert.equal(result.paymentStatus, PAYMENT_STATUSES.PAID);
  assert.equal(published[0].type, "PaymentConfirmed");
  assert.equal(logger.entries.at(-1).msg, "Payment event published");
});

test("verifyWebhook returns received for unhandled events and missing sessions", async () => {
  const unhandled = buildVerifyWebhookUseCase({
    webhookEnabled: true,
    paymentGateway: { verifyWebhook: () => null },
    paymentRepository: {},
    paymentEventPublisher: {},
    logger: createLogger(),
  });

  assert.deepEqual(await unhandled({ rawBody: "{}", signature: "sig" }), { received: true });

  const missingSession = buildVerifyWebhookUseCase({
    webhookEnabled: true,
    paymentGateway: { verifyWebhook: () => ({ sessionId: "missing", paymentStatus: "paid" }) },
    paymentRepository: { findBySessionId: async () => null },
    paymentEventPublisher: {},
    logger: createLogger(),
  });

  assert.deepEqual(await missingSession({ rawBody: "{}", signature: "sig" }), { received: true });
});

test("getPaymentByOrderId returns read model or throws when missing", async () => {
  const getPayment = buildGetPaymentByOrderIdUseCase({
    paymentRepository: {
      findByOrderId: async (orderId) => ({
        _id: "pay1",
        orderId,
        provider: "stripe",
        workflowType: "checkout",
        paymentStatus: "pending",
      }),
    },
  });

  assert.equal((await getPayment({ orderId: "o1" }))._id, "pay1");

  const getMissingPayment = buildGetPaymentByOrderIdUseCase({
    paymentRepository: { findByOrderId: async () => null },
  });

  await assert.rejects(() => getMissingPayment({ orderId: "missing" }), PaymentNotFoundError);
});
