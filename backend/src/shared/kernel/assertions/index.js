/**
 * Shared Kernel — pure assertion utilities.
 *
 * Rules:
 *  - ZERO imports from any other project layer.
 *  - Safe to import from domain, application, or infrastructure.
 *  - All functions throw plain Error — callers wrap in domain/app errors.
 */

export const assertNonEmptyString = (value, fieldName) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
};

export const assertObject = (value, fieldName) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fieldName} must be a non-null object`);
  }
};

export const assertArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }
};

export const assertNonEmptyArray = (value, fieldName) => {
  assertArray(value, fieldName);
  if (value.length === 0) {
    throw new Error(`${fieldName} must not be empty`);
  }
};

export const assertFunction = (value, fieldName) => {
  if (typeof value !== "function") {
    throw new Error(`${fieldName} must be a function`);
  }
};

export const assertPositiveNumber = (value, fieldName) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
};

export const assertNonNegativeNumber = (value, fieldName) => {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }
};

export const assertRequiredFields = (obj, fields, label = "object") => {
  assertObject(obj, label);
  const missing = fields.filter(
    (f) => obj[f] === undefined || obj[f] === null || obj[f] === ""
  );
  if (missing.length > 0) {
    throw new Error(`${label}: missing required fields: ${missing.join(", ")}`);
  }
};
