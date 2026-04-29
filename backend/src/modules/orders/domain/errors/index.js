/**
 * Orders Domain Errors.
 * Fixed:
 *  - Extend DomainValidationError/DomainNotFoundError from shared kernel
 *  - error.code is inherited correctly (was broken with plain Error)
 *  - Typo fixed: "TRANSACION" → "TRANSITION"
 */
import {
  DomainValidationError,
  DomainNotFoundError,
} from "../../../../shared/domain/errors/index.js";

export class OrderStatusTransitionNotAllowedError extends DomainValidationError {
  constructor(message) {
    super(message);
    this.code = "VALIDATION"; // ensures 400 HTTP response
  }
}

export class ImmutableFieldsAfterOrderPlacementError extends DomainValidationError {
  constructor(message) {
    super(message);
    this.code = "VALIDATION";
  }
}

export class OrderStatusNotAllowedError extends DomainValidationError {
  constructor(message) {
    super(message);
    this.code = "VALIDATION";
  }
}

export class OrderDomainNotFoundError extends DomainNotFoundError {
  constructor(message) { super(message); }
}
