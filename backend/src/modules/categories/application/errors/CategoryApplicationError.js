import { ApplicationError } from "../../../../shared/application/errors/ApplicationError.js";

export class CategoryValidationError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "CATEGORY_VALIDATION", ...options });
  }
}

export class CategoryNotFoundError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "CATEGORY_NOT_FOUND", ...options });
  }
}
