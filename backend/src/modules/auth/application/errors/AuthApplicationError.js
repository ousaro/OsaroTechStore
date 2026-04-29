/**
 * Auth Module — Application Errors.
 * All extend shared ApplicationError so resolveHttpError maps them correctly.
 */
import {
  ApplicationValidationError,
  ApplicationUnauthorizedError,
  ApplicationConflictError,
} from "../../../../shared/application/errors/index.js";

export class AuthValidationError extends ApplicationValidationError {
  constructor(message) { super(message); }
}

export class AuthUnauthorizedError extends ApplicationUnauthorizedError {
  constructor(message) { super(message); }
}

export class AuthConflictError extends ApplicationConflictError {
  constructor(message) { super(message); }
}
