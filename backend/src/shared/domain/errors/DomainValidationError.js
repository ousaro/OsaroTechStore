import { ApplicationError } from "../../application/errors/ApplicationError.js";

export class DomainValidationError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "DOMAIN_VALIDATION", ...options });
  }
}
