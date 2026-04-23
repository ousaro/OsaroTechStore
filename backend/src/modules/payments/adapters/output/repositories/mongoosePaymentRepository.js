import PaymentModel from "../persistence/paymentModel.js";
import { assertPaymentRepositoryPort } from "../../../ports/output/paymentRepositoryPort.js";
import { toPaymentRecord } from "./paymentRecordMapper.js";

export const createMongoosePaymentRepository = () => {
  const savePaymentWorkflow = async (paymentWorkflow) => {
    const workflowId = paymentWorkflow.id;
    const providerPaymentId =
      paymentWorkflow.providerPaymentId ?? paymentWorkflow.providerTransactionId;
    const provider = paymentWorkflow.provider ?? "stripe";
    const workflowType = paymentWorkflow.workflowType ?? "redirect_session";

    const doc = await PaymentModel.findOneAndUpdate(
      {
        $or: [{ providerWorkflowId: workflowId }, { sessionId: workflowId }],
      },
      {
        providerWorkflowId: workflowId,
        sessionId: workflowId,
        ...(paymentWorkflow.url ? { url: paymentWorkflow.url } : {}),
        ...(providerPaymentId ? { providerPaymentId, providerTransactionId: providerPaymentId } : {}),
        ...(paymentWorkflow.providerStatus
          ? { providerStatus: paymentWorkflow.providerStatus }
          : {}),
        paymentStatus: paymentWorkflow.paymentStatus,
        provider,
        workflowType,
        statusUpdatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return toPaymentRecord(doc);
  };

  const findPaymentWorkflowById = async (paymentId) => {
    const doc = await PaymentModel.findOne({
      $or: [{ providerWorkflowId: paymentId }, { sessionId: paymentId }],
    });
    return toPaymentRecord(doc);
  };

  const repository = {
    async savePaymentWorkflow(paymentWorkflow) {
      return savePaymentWorkflow(paymentWorkflow);
    },

    async savePaymentSession(session) {
      return savePaymentWorkflow(session);
    },

    async findPaymentWorkflowById(paymentId) {
      return findPaymentWorkflowById(paymentId);
    },

    async findPaymentSessionById(sessionId) {
      return findPaymentWorkflowById(sessionId);
    },

    async linkPaymentToOrder({ paymentReference, orderId }) {
      const doc = await PaymentModel.findOneAndUpdate(
        { paymentReference },
        { orderId },
        { new: true }
      );

      return toPaymentRecord(doc);
    },

    async updatePaymentWorkflowStatus(paymentId, paymentStatus) {
      const doc = await PaymentModel.findOneAndUpdate(
        {
          $or: [{ providerWorkflowId: paymentId }, { sessionId: paymentId }],
        },
        { paymentStatus, statusUpdatedAt: new Date() },
        { new: true }
      );

      return toPaymentRecord(doc);
    },

    async updatePaymentSessionStatus(sessionId, paymentStatus) {
      const doc = await PaymentModel.findOneAndUpdate(
        {
          $or: [{ providerWorkflowId: sessionId }, { sessionId }],
        },
        { paymentStatus, statusUpdatedAt: new Date() },
        { new: true }
      );

      return toPaymentRecord(doc);
    },

    async applyWebhookStateChangeOnce({
      eventId,
      id,
      sessionId,
      provider,
      workflowType,
      providerPaymentId,
      providerTransactionId,
      providerStatus,
      occurredAt,
      paymentStatus,
      paymentOutcome,
    }) {
      const workflowId = id ?? sessionId;
      const normalizedProviderPaymentId =
        providerPaymentId ?? providerTransactionId;
      const effectiveOccurredAt =
        occurredAt instanceof Date && !Number.isNaN(occurredAt.valueOf())
          ? occurredAt
          : new Date();
      const doc = await PaymentModel.findOneAndUpdate(
        {
          $or: [{ providerWorkflowId: workflowId }, { sessionId: workflowId }],
          processedWebhookEventIds: { $ne: eventId },
        },
        {
          providerWorkflowId: workflowId,
          sessionId: workflowId,
          paymentStatus,
          ...(provider ? { provider } : {}),
          ...(workflowType ? { workflowType } : {}),
          ...(normalizedProviderPaymentId
            ? {
                providerPaymentId: normalizedProviderPaymentId,
                providerTransactionId: normalizedProviderPaymentId,
              }
            : {}),
          ...(providerStatus ? { providerStatus } : {}),
          lastWebhookEventId: eventId,
          statusUpdatedAt: effectiveOccurredAt,
          ...(paymentStatus === "paid" ? { paidAt: effectiveOccurredAt } : {}),
          ...(paymentStatus === "failed" &&
          paymentOutcome !== "expired"
            ? { failedAt: effectiveOccurredAt }
            : {}),
          ...(paymentOutcome === "expired"
            ? { expiredAt: effectiveOccurredAt }
            : {}),
          ...(paymentStatus === "refunded"
            ? { refundedAt: effectiveOccurredAt }
            : {}),
          $addToSet: { processedWebhookEventIds: eventId },
        },
        { new: true }
      );

      return toPaymentRecord(doc);
    },
  };

  assertPaymentRepositoryPort(repository, [
    "savePaymentWorkflow",
    "findPaymentWorkflowById",
    "savePaymentSession",
    "findPaymentSessionById",
    "linkPaymentToOrder",
    "updatePaymentWorkflowStatus",
    "updatePaymentSessionStatus",
    "applyWebhookStateChangeOnce",
  ]);

  return repository;
};
