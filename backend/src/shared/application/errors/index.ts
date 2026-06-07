export class ApplicationError extends Error {
  code: string;

  constructor(message: string, code = "APPLICATION_ERROR") {
    super(message);
    this.name = new.target.name;
    this.code = code;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ApplicationValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, "VALIDATION");
  }
}

export class ApplicationUnauthorizedError extends ApplicationError {
  constructor(message: string) {
    super(message, "UNAUTHORIZED");
  }
}

export class ApplicationForbiddenError extends ApplicationError {
  constructor(message: string) {
    super(message, "FORBIDDEN");
  }
}

export class ApplicationNotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
  }
}

export class ApplicationConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, "CONFLICT");
  }
}

export class ServiceUnavailableError extends ApplicationError {
  constructor(message: string) {
    super(message, "SERVICE_UNAVAILABLE");
  }
}
