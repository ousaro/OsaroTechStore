import { PaymentValidationError } from "../errors/PaymentApplicationError.js";

export const assertNonEmptyArray = (value, message = "Expected a non-empty array") => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new PaymentValidationError(message);
  }
};

export const assertPositiveNumber = (value, message = "Value must be a positive number") => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new PaymentValidationError(message);
  }
};

export const assertString = (value, message = "Expected a non-empty string") => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new PaymentValidationError(message);
  }
};
