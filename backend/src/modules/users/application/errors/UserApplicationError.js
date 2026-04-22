import { ApplicationError } from "../../../../shared/application/errors/ApplicationError.js";

export class UserNotFoundError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "USER_NOT_FOUND", ...options });
  }
}

export class UserValidationError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "USER_VALIDATION", ...options });
  }
}
