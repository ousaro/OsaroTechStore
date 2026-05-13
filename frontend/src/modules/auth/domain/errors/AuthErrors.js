import { DomainError } from "../../../../shared/domain/errors/DomainError.js";

export class InvalidCredentialsError extends DomainError {
  constructor() { super("Invalid email or password", "INVALID_CREDENTIALS"); }
}

export class RegistrationError extends DomainError {
  constructor(msg) { super(msg || "Registration failed", "REGISTRATION_FAILED"); }
}
