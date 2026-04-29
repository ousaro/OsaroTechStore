/**
 * Shared Domain Errors — Shared Kernel.
 *
 * All domain errors in every module extend these.
 * The error .code drives HTTP status code mapping in resolveHttpError.js.
 *
 * Hierarchy:
 *   DomainError (base)
 *   ├── DomainValidationError   → 400
 *   ├── DomainNotFoundError     → 404
 *   └── DomainConflictError     → 409
 */

export class DomainError extends Error {
  constructor(message, code = "DOMAIN_ERROR") {
    super(message);
    this.name = new.target.name;
    this.code = code;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class DomainValidationError extends DomainError {
  constructor(message, options = {}) {
    super(message, "VALIDATION");
    if (options.meta) this.meta = options.meta;
  }
}

export class DomainNotFoundError extends DomainError {
  constructor(message) {
    super(message, "NOT_FOUND");
  }
}

export class DomainConflictError extends DomainError {
  constructor(message) {
    super(message, "CONFLICT");
  }
}
