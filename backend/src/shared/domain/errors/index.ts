export class DomainError extends Error {
  code: string;

  constructor(message: string, code = "DOMAIN_ERROR") {
    super(message);
    this.name = new.target.name;
    this.code = code;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

interface ValidationMeta {
  meta?: Record<string, unknown>;
}

export class DomainValidationError extends DomainError {
  meta?: Record<string, unknown>;

  constructor(message: string, options: ValidationMeta = {}) {
    super(message, "VALIDATION");
    if (options.meta) this.meta = options.meta;
  }
}

export class DomainNotFoundError extends DomainError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
  }
}

export class DomainConflictError extends DomainError {
  constructor(message: string) {
    super(message, "CONFLICT");
  }
}
