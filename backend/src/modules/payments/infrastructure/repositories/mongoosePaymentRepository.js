import PaymentModel from "../persistence/paymentModel.js";
import { assertPaymentRepositoryPort } from "../../ports/output/paymentRepositoryPort.js";
import { toPaymentRecord } from "./paymentRecordMapper.js";

export const createMongoosePaymentRepository = () => {
  const repository = {
    async savePaymentSession(session) {
      const doc = await PaymentModel.findOneAndUpdate(
        { sessionId: session.id },
        {
          sessionId: session.id,
          ...(session.url ? { url: session.url } : {}),
          ...(session.providerTransactionId
            ? { providerTransactionId: session.providerTransactionId }
            : {}),
          paymentStatus: session.paymentStatus,
          provider: "stripe",
          statusUpdatedAt: new Date(),
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      return toPaymentRecord(doc);
    },

    async findPaymentSessionById(sessionId) {
      const doc = await PaymentModel.findOne({ sessionId });
      return toPaymentRecord(doc);
    },

    async linkPaymentToOrder({ paymentReference, orderId }) {
      const doc = await PaymentModel.findOneAndUpdate(
        { paymentReference },
        { orderId },
        { new: true }
      );

      return toPaymentRecord(doc);
    },

    async updatePaymentSessionStatus(sessionId, paymentStatus) {
      const doc = await PaymentModel.findOneAndUpdate(
        { sessionId },
        { paymentStatus, statusUpdatedAt: new Date() },
        { new: true }
      );

      return toPaymentRecord(doc);
    },

    async applyWebhookStateChangeOnce({
      eventId,
      sessionId,
      providerTransactionId,
      occurredAt,
      paymentStatus,
    }) {
      const effectiveOccurredAt =
        occurredAt instanceof Date && !Number.isNaN(occurredAt.valueOf())
          ? occurredAt
          : new Date();
      const doc = await PaymentModel.findOneAndUpdate(
        {
          sessionId,
          processedWebhookEventIds: { $ne: eventId },
        },
        {
          paymentStatus,
          ...(providerTransactionId ? { providerTransactionId } : {}),
          lastWebhookEventId: eventId,
          statusUpdatedAt: effectiveOccurredAt,
          ...(paymentStatus === "paid" ? { paidAt: effectiveOccurredAt } : {}),
          $addToSet: { processedWebhookEventIds: eventId },
        },
        { new: true }
      );

      return toPaymentRecord(doc);
    },
  };

  assertPaymentRepositoryPort(repository, [
    "savePaymentSession",
    "findPaymentSessionById",
    "linkPaymentToOrder",
    "updatePaymentSessionStatus",
    "applyWebhookStateChangeOnce",
  ]);

  return repository;
};
