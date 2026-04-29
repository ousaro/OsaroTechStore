/**
 * Shared Application Errors.
 *
 * Application errors wrap domain errors or represent use-case-level failures.
 * They carry an HTTP-mappable .code that resolveHttpError.js uses.
 *
 * Hierarchy:
 *   ApplicationError (base)
 *   ├── ApplicationValidationError  → 400
 *   ├── ApplicationUnauthorizedError→ 401
 *   ├── ApplicationForbiddenError   → 403
 *   ├── ApplicationNotFoundError    → 404
 *   ├── ApplicationConflictError    → 409
 *   └── ServiceUnavailableError     → 503
 */

export class ApplicationError extends Error {
  constructor(message, code = "APPLICATION_ERROR") {
    super(message);
    this.name = new.target.name;
    this.code = code;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ApplicationValidationError extends ApplicationError {
  constructor(message) {
    super(message, "VALIDATION");
  }
}

export class ApplicationUnauthorizedError extends ApplicationError {
  constructor(message) {
    super(message, "UNAUTHORIZED");
  }
}

export class ApplicationForbiddenError extends ApplicationError {
  constructor(message) {
    super(message, "FORBIDDEN");
  }
}

export class ApplicationNotFoundError extends ApplicationError {
  constructor(message) {
    super(message, "NOT_FOUND");
  }
}

export class ApplicationConflictError extends ApplicationError {
  constructor(message) {
    super(message, "CONFLICT");
  }
}

export class ServiceUnavailableError extends ApplicationError {
  constructor(message) {
    super(message, "SERVICE_UNAVAILABLE");
  }
}
