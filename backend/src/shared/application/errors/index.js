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
