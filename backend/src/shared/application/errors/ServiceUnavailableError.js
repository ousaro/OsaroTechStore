import { ApplicationError } from "./ApplicationError.js";

export class ServiceUnavailableError extends ApplicationError {
  constructor(message, options = {}) {
    super(message, { code: "SERVICE_UNAVAILABLE", ...options });
  }
}
