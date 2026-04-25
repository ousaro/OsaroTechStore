import { ApplicationError } from "./ApplicationError.js";

export class ServiceUnavailableError extends ApplicationError {
  constructor(message = "Service unavailable", options = {}) {
    super(message, {
      code: "SERVICE_UNAVAILABLE",
      ...options,
    });
  }
}