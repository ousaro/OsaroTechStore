import { ApplicationError } from "../../../../shared/application/errors/ApplicationError.js";

export class ProductNotFoundError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "PRODUCT_NOT_FOUND", ...options });
  }
}
