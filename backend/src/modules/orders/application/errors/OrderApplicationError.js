import { ApplicationError } from "../../../../shared/application/errors/ApplicationError.js";

export class OrderNotFoundError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "ORDER_NOT_FOUND", ...options });
  }
}
