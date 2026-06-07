import { createPaymentWorkflow } from "../../domain/entities/PaymentWorkflow.js";
import {
  applyWebhookStateChange,
  shouldPublishPaymentEvent,
} from "../../domain/services/paymentWorkflowService.js";
import { createPaymentStateChangedEvent } from "../../domain/events/index.js";
import { PaymentsDisabledError } from "../errors/PaymentApplicationError.js";
import { toPaymentReadModel } from "../read-models/paymentReadModel.js";

export const buildVerifyWebhookUseCase =
  ({
    paymentGateway,
    paymentRepository,
    paymentEventPublisher,
    webhookEnabled,
    logger,
    idempotencyStore,
  }) =>
  async ({ rawBody, signature }) => {
    if (!webhookEnabled) throw new PaymentsDisabledError();

    const stateChange = paymentGateway.verifyWebhook(rawBody, signature);
    if (!stateChange) {
      logger?.debug({ msg: "Webhook: unhandled event type, skipping" });
      return { received: true };
    }

    const eventId = stateChange.eventId;
    if (eventId && idempotencyStore) {
      if (await idempotencyStore.isProcessed(eventId)) {
        logger?.debug({ msg: "Webhook: event already processed, skipping", eventId });
        return { received: true };
      }
    }

    const existing = await paymentRepository.findBySessionId(stateChange.sessionId);
    if (!existing) {
      logger?.warn({
        msg: "Webhook: no payment found for session",
        sessionId: stateChange.sessionId,
      });
      if (eventId && idempotencyStore) {
        await idempotencyStore.markProcessed(eventId);
      }
      return { received: true };
    }

    const workflow = createPaymentWorkflow(existing);
    const updated = applyWebhookStateChange(workflow, stateChange);
    const saved = await paymentRepository.updateById(existing._id, updated.toPrimitives());

    if (eventId && idempotencyStore) {
      await idempotencyStore.markProcessed(eventId);
    }

    if (shouldPublishPaymentEvent(stateChange.paymentStatus)) {
      const event = createPaymentStateChangedEvent(updated);
      await paymentEventPublisher.publish(event);
      logger?.info({
        msg: "Payment event published",
        type: event.type,
        orderId: updated.orderId,
        paymentStatus: stateChange.paymentStatus,
      });
    }

    return toPaymentReadModel(saved);
  };
