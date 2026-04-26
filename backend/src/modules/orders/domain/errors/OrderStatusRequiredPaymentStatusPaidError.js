
export class OrderStatusRequiredPaymentStatusPaidError extends Error {
  constructor(message, options = {}) {
    super(message, { code: "ORDER_STATUS_PAYMENT_STATUS_PAID", ...options });
  }
}
