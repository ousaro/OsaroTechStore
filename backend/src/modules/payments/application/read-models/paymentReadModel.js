export const toPaymentReadModel = (payment) => {
  if (!payment) {
    return null;
  }

  return Object.fromEntries(
    Object.entries({
      id: payment.id,
      paymentReference: payment.paymentReference,
      orderId: payment.orderId,
      url: payment.url,
      provider: payment.provider,
      workflowType: payment.workflowType,
      paymentStatus: payment.paymentStatus,
      statusUpdatedAt: payment.statusUpdatedAt,
      paidAt: payment.paidAt,
      failedAt: payment.failedAt,
      expiredAt: payment.expiredAt,
      refundedAt: payment.refundedAt,
    }).filter(([, value]) => value !== undefined)
  );
};
