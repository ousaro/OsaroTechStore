/**
 * Payment Record Mapper.
 * Fixed: snake_case fields (payment_status) are normalized HERE,
 * not inside the domain entity (was a DDD violation in the original).
 */
export const toPaymentRecord = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id:               obj._id?.toString(),
    orderId:           obj.orderId?.toString(),
    provider:          obj.provider,
    workflowType:      obj.workflowType,
    // Normalize: DB may store payment_status (legacy) or paymentStatus
    paymentStatus:     obj.paymentStatus ?? obj.payment_status ?? "pending",
    sessionId:         obj.sessionId,
    providerPaymentId: obj.providerPaymentId,
    providerStatus:    obj.providerStatus,
    url:               obj.url,
    occurredAt:        obj.occurredAt,
    createdAt:         obj.createdAt,
    updatedAt:         obj.updatedAt,
  };
};
