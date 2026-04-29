import { ApplicationValidationError, ApplicationNotFoundError }
  from "../../../../shared/application/errors/index.js";

export class ProductValidationError extends ApplicationValidationError {
  constructor(message) { super(message); }
}

export class ProductNotFoundError extends ApplicationNotFoundError {
  constructor(message) { super(message); }
}
