export const toPaymentRecord = (doc) => {
  if (!doc) return null;

  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id: obj._id?.toString(),
    orderId: obj.orderId?.toString(),
    provider: obj.provider,
    workflowType: obj.workflowType,
    paymentStatus: obj.paymentStatus ?? obj.payment_status ?? "pending",
    sessionId: obj.sessionId,
    providerPaymentId: obj.providerPaymentId,
    providerStatus: obj.providerStatus,
    url: obj.url,
    occurredAt: obj.occurredAt,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};
