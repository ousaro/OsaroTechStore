import validator from "validator";
import { DomainValidationError } from "../../../../shared/domain/errors/index.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const createEmail = (value) => {
  try {
    assertNonEmptyString(value, "email");
  } catch (_err) {
    throw new DomainValidationError("Email must be a non-empty string");
  }

  const normalized = value.trim().toLowerCase();
  if (!validator.isEmail(normalized)) {
    throw new DomainValidationError("Please enter a valid email address");
  }
  return Object.freeze({
    value: normalized,
    toPrimitives: () => normalized,
    toString: () => normalized,
  });
};
