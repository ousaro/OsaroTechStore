export const assertNonEmptyString = (value: unknown, fieldName: string, message?: string): void => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(message || `${fieldName} must be a non-empty string`);
  }
};

export const assertObject = (value: unknown, fieldName: string, message?: string): void => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(message || `${fieldName} must be a non-null object`);
  }
};

export const assertArray = (value: unknown, fieldName: string, message?: string): void => {
  if (!Array.isArray(value)) {
    throw new Error(message || `${fieldName} must be an array`);
  }
};

export const assertNonEmptyArray = (value: unknown, fieldName: string, message?: string): void => {
  assertArray(value, fieldName);
  if ((value as unknown[]).length === 0) {
    throw new Error(message || `${fieldName} must not be empty`);
  }
};

export const assertFunction = (value: unknown, fieldName: string, message?: string): void => {
  if (typeof value !== "function") {
    throw new Error(message || `${fieldName} must be a function`);
  }
};

export const assertBoolean = (value: unknown, fieldName: string, message?: string): void => {
  if (typeof value !== "boolean") {
    throw new Error(message || `${fieldName} must be a boolean`);
  }
};

export const assertPositiveNumber = (value: unknown, fieldName: string, message?: string): void => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new Error(message || `${fieldName} must be a positive number`);
  }
};

export const assertNonNegativeNumber = (
  value: unknown,
  fieldName: string,
  message?: string
): void => {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new Error(message || `${fieldName} must be a non-negative number`);
  }
};

export const assertRequiredFields = (
  obj: Record<string, unknown>,
  fields: string[],
  label = "object",
  message?: string
): void => {
  assertObject(obj, label);
  const missing = fields.filter((f) => obj[f] === undefined || obj[f] === null || obj[f] === "");
  if (missing.length > 0) {
    throw new Error(message || `${label}: missing required fields: ${missing.join(", ")}`);
  }
};
