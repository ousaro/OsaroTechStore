export const toPaymentRecord = (rawPayment) => {
  if (!rawPayment) {
    return null;
  }

  return {
    id: rawPayment.sessionId,
    paymentReference: rawPayment.paymentReference,
    ...(rawPayment.url ? { url: rawPayment.url } : {}),
    ...(rawPayment.providerTransactionId
      ? { providerTransactionId: rawPayment.providerTransactionId }
      : {}),
    paymentStatus: rawPayment.paymentStatus,
    ...(rawPayment.lastWebhookEventId
      ? { lastWebhookEventId: rawPayment.lastWebhookEventId }
      : {}),
    ...(rawPayment.statusUpdatedAt
      ? { statusUpdatedAt: rawPayment.statusUpdatedAt }
      : {}),
    ...(rawPayment.paidAt ? { paidAt: rawPayment.paidAt } : {}),
  };
};
