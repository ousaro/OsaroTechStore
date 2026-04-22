import { ApplicationError } from "../../../../shared/application/errors/ApplicationError.js";

export class PaymentValidationError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "PAYMENT_VALIDATION", ...options });
  }
}

export class PaymentWebhookError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "PAYMENT_WEBHOOK_ERROR", ...options });
  }
}
