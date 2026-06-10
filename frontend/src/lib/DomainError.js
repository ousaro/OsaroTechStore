export class DomainError extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class NotFoundError extends DomainError {
  constructor(entity, id) {
    super(`${entity} not found${id ? `: ${id}` : ""}`, "NOT_FOUND");
  }
}

export class ValidationError extends DomainError {
  constructor(message) {
    super(message, "VALIDATION_ERROR");
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN");
  }
}
