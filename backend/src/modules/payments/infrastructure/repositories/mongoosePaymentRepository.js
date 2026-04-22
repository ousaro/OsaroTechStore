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
          paymentStatus: session.paymentStatus,
          provider: "stripe",
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

    async updatePaymentSessionStatus(sessionId, paymentStatus) {
      const doc = await PaymentModel.findOneAndUpdate(
        { sessionId },
        { paymentStatus },
        { new: true }
      );

      return toPaymentRecord(doc);
    },

    async applyWebhookStateChangeOnce({ eventId, sessionId, paymentStatus }) {
      const doc = await PaymentModel.findOneAndUpdate(
        {
          sessionId,
          processedWebhookEventIds: { $ne: eventId },
        },
        {
          paymentStatus,
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
    "updatePaymentSessionStatus",
    "applyWebhookStateChangeOnce",
  ]);

  return repository;
};
