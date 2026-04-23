export const toPaymentRecord = (rawPayment) => {
  if (!rawPayment) {
    return null;
  }

  return {
    id: rawPayment.providerWorkflowId ?? rawPayment.sessionId,
    paymentReference: rawPayment.paymentReference,
    ...(rawPayment.orderId ? { orderId: rawPayment.orderId } : {}),
    ...(rawPayment.url ? { url: rawPayment.url } : {}),
    ...(rawPayment.provider ? { provider: rawPayment.provider } : {}),
    ...(rawPayment.workflowType ? { workflowType: rawPayment.workflowType } : {}),
    ...(rawPayment.providerPaymentId ?? rawPayment.providerTransactionId
      ? {
          providerPaymentId:
            rawPayment.providerPaymentId ?? rawPayment.providerTransactionId,
        }
      : {}),
    ...(rawPayment.providerStatus ? { providerStatus: rawPayment.providerStatus } : {}),
    paymentStatus: rawPayment.paymentStatus,
    ...(rawPayment.lastWebhookEventId
      ? { lastWebhookEventId: rawPayment.lastWebhookEventId }
      : {}),
    ...(rawPayment.statusUpdatedAt
      ? { statusUpdatedAt: rawPayment.statusUpdatedAt }
      : {}),
    ...(rawPayment.paidAt ? { paidAt: rawPayment.paidAt } : {}),
    ...(rawPayment.failedAt ? { failedAt: rawPayment.failedAt } : {}),
    ...(rawPayment.expiredAt ? { expiredAt: rawPayment.expiredAt } : {}),
    ...(rawPayment.refundedAt ? { refundedAt: rawPayment.refundedAt } : {}),
  };
};
