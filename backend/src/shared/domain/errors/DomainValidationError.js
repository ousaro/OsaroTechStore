import { ApplicationError } from "../../application/errors/ApplicationError.js";

// TODO : remove this and make each module has its own error spec type
export class DomainValidationError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "DOMAIN_VALIDATION", ...options });
  }
}
