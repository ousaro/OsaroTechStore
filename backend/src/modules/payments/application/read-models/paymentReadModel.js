export const toPaymentReadModel = (record) => {
  if (!record) return null;
  return {
    _id:               record._id?.toString(),
    orderId:           record.orderId?.toString(),
    provider:          record.provider,
    workflowType:      record.workflowType,
    paymentStatus:     record.paymentStatus,
    sessionId:         record.sessionId,
    providerPaymentId: record.providerPaymentId,
    url:               record.url,
    occurredAt:        record.occurredAt,
    createdAt:         record.createdAt,
    updatedAt:         record.updatedAt,
  };
};
