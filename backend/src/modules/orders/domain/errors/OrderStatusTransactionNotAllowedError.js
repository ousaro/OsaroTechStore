
export class OrderStatusTransactionNotAllowedError extends Error {
  constructor(message, options = {}) {
    super(message, { code: "ORDER_STATUS_TRANSACION_INVALID", ...options });
  }
}
