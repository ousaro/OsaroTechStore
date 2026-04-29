/**
 * Payments Application Use Cases.
 *
 * Fixed from original:
 *  - No env import — paymentsEnabled injected by composition root.
 *  - linkPaymentToOrder is a proper use case (was inline in composition).
 *  - verifyWebhook publishes domain events via eventBus, not direct import.
 */
import { createPaymentWorkflow }      from "../domain/entities/PaymentWorkflow.js";
import { applyWebhookStateChange, shouldPublishPaymentEvent }
                                      from "../../domain/services/paymentWorkflowService.js";
import { createPaymentStateChangedEvent }
                                      from "../../domain/events/index.js";
import { PaymentsDisabledError, PaymentNotFoundError }
                                      from "../errors/PaymentApplicationError.js";
import { assertNonEmptyString }       from "../../../../shared/kernel/assertions/index.js";
import { toPaymentReadModel }         from "../read-models/paymentReadModel.js";

// ── createPaymentIntent ───────────────────────────────────────────────────────

export const buildCreatePaymentIntentUseCase = ({
  paymentGateway,
  paymentRepository,
  paymentsEnabled,
  clientUrl,
  logger,
}) =>
  async ({ orderId, items, currency }) => {
    if (!paymentsEnabled) throw new PaymentsDisabledError();
    assertNonEmptyString(orderId, "orderId");

    const successUrl = `${clientUrl}/payment-success?orderId=${orderId}`;
    const cancelUrl  = `${clientUrl}/payment-cancelled?orderId=${orderId}`;

    const session = await paymentGateway.createRedirectPayment({
      items,
      successUrl,
      cancelUrl,
    });

    const workflow = createPaymentWorkflow({
      orderId,
      provider:     session.provider,
      workflowType: session.workflowType,
      sessionId:    session.id,
      url:          session.url,
    });

    const saved = await paymentRepository.create(workflow.toPrimitives());

    logger?.info({ msg: "Payment intent created", orderId, sessionId: session.id });
    return toPaymentReadModel(saved);
  };

// ── verifyWebhook ─────────────────────────────────────────────────────────────

export const buildVerifyWebhookUseCase = ({
  paymentGateway,
  paymentRepository,
  paymentEventPublisher,
  webhookEnabled,
  logger,
}) =>
  async ({ rawBody, signature }) => {
    if (!webhookEnabled) throw new PaymentsDisabledError();

    const stateChange = paymentGateway.verifyWebhook(rawBody, signature);
    if (!stateChange) {
      logger?.debug({ msg: "Webhook: unhandled event type, skipping" });
      return { received: true };
    }

    const existing = await paymentRepository.findBySessionId(stateChange.sessionId);
    if (!existing) {
      logger?.warn({ msg: "Webhook: no payment found for session", sessionId: stateChange.sessionId });
      return { received: true };
    }

    const workflow = createPaymentWorkflow(existing);
    const updated  = applyWebhookStateChange(workflow, stateChange);
    const saved    = await paymentRepository.updateById(existing._id, updated.toPrimitives());

    if (shouldPublishPaymentEvent(stateChange.paymentStatus)) {
      const event = createPaymentStateChangedEvent(updated);
      await paymentEventPublisher.publish(event);
      logger?.info({
        msg:           "Payment event published",
        type:          event.type,
        orderId:       updated.orderId,
        paymentStatus: stateChange.paymentStatus,
      });
    }

    return toPaymentReadModel(saved);
  };

// ── linkPaymentToOrder ────────────────────────────────────────────────────────
// Collaboration use case — called by the OrderPlaced event translator.

export const buildLinkPaymentToOrderUseCase = ({
  paymentGateway,
  paymentRepository,
  paymentsEnabled,
  clientUrl,
  logger,
}) =>
  async ({ orderId, orderLines, currency }) => {
    if (!paymentsEnabled) return null; // silently skip when payments disabled

    const items = orderLines.map((l) => ({
      name:     l.name,
      price:    l.unitPrice?.amount ?? l.price,
      quantity: l.quantity,
    }));

    const successUrl = `${clientUrl}/payment-success?orderId=${orderId}`;
    const cancelUrl  = `${clientUrl}/payment-cancelled?orderId=${orderId}`;

    const session = await paymentGateway.createRedirectPayment({ items, successUrl, cancelUrl });

    const workflow = createPaymentWorkflow({
      orderId,
      provider:     session.provider,
      workflowType: session.workflowType,
      sessionId:    session.id,
      url:          session.url,
    });

    const saved = await paymentRepository.create(workflow.toPrimitives());
    logger?.info({ msg: "Payment linked to order", orderId, sessionId: session.id });
    return toPaymentReadModel(saved);
  };

// ── getPaymentByOrderId ───────────────────────────────────────────────────────

export const buildGetPaymentByOrderIdUseCase = ({ paymentRepository }) =>
  async ({ orderId }) => {
    assertNonEmptyString(orderId, "orderId");
    const record = await paymentRepository.findByOrderId(orderId);
    if (!record) throw new PaymentNotFoundError(`No payment found for order ${orderId}`);
    return toPaymentReadModel(record);
  };
