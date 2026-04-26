
export class OrderStatusNotAllowedError extends Error {
  constructor(message, options = {}) {
    super(message, { code: "ORDER_STATUS_INVALID", ...options });
  }
}
