import {
  ApplicationValidationError,
  ApplicationNotFoundError,
  ServiceUnavailableError,
} from "../../../../shared/application/errors/index.js";

export class PaymentValidationError extends ApplicationValidationError {
  constructor(message) { super(message); }
}

export class PaymentNotFoundError extends ApplicationNotFoundError {
  constructor(message) { super(message); }
}

export class PaymentsDisabledError extends ServiceUnavailableError {
  constructor() {
    super("Payment processing is not enabled. Set PAYMENT_PROVIDER in .env");
  }
}
