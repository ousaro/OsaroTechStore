import {
  DomainValidationError,
  DomainNotFoundError,
} from "../../../../shared/domain/errors/index.js";

export class OrderStatusTransitionNotAllowedError extends DomainValidationError {
  constructor(message) {
    super(message);
    this.code = "VALIDATION";
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
  constructor(message) {
    super(message);
  }
}
