import { HttpValidationError } from "./HttpValidationError.js";

export const assertRequiredFields = (payload, requiredFields, message = "Missing required fields") => {
  const emptyFields = requiredFields.filter((field) => !payload?.[field]);
  if (emptyFields.length > 0) {
    throw new HttpValidationError(message, { meta: { emptyFields } });
  }
};

export const assertArray = (value, message = "Expected an array") => {
  if (!Array.isArray(value)) {
    throw new HttpValidationError(message);
  }
};

export const assertNonEmptyArray = (value, message = "Expected a non-empty array") => {
  assertArray(value, message);
  if (value.length === 0) {
    throw new HttpValidationError(message);
  }
};

export const assertPositiveNumber = (value, message = "Value must be a positive number") => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new HttpValidationError(message);
  }
};

export const assertString = (value, message = "Expected a non-empty string") => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpValidationError(message);
  }
};
