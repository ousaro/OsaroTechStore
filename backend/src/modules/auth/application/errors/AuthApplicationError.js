import {
  ApplicationValidationError,
  ApplicationUnauthorizedError,
  ApplicationConflictError,
} from "../../../../shared/application/errors/index.js";

export class AuthValidationError extends ApplicationValidationError {
  constructor(message) {
    super(message);
  }
}

export class AuthUnauthorizedError extends ApplicationUnauthorizedError {
  constructor(message) {
    super(message);
  }
}

export class AuthConflictError extends ApplicationConflictError {
  constructor(message) {
    super(message);
  }
}
