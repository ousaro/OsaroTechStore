import {
  ApplicationValidationError,
  ApplicationNotFoundError,
} from "../../../../shared/application/errors/index.js";

export class OrderValidationError extends ApplicationValidationError {
  constructor(message) { super(message); }
}

export class OrderNotFoundError extends ApplicationNotFoundError {
  constructor(message) { super(message); }
}
