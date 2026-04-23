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
      paymentStatus: payment.paymentStatus,
      statusUpdatedAt: payment.statusUpdatedAt,
      paidAt: payment.paidAt,
    }).filter(([, value]) => value !== undefined)
  );
};
