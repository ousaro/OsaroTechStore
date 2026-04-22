import { ApplicationError } from "../../../../shared/application/errors/ApplicationError.js";

export class AuthValidationError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "AUTH_VALIDATION", ...options });
  }
}

export class AuthConflictError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "AUTH_CONFLICT", ...options });
  }
}

export class AuthUnauthorizedError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "AUTH_UNAUTHORIZED", ...options });
  }
}
