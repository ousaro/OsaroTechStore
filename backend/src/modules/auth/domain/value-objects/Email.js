import validator from "validator";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export const createEmail = (value) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new DomainValidationError("Please enter a valid email");
  }

  const normalizedValue = value.trim().toLowerCase();

  if (!validator.isEmail(normalizedValue)) {
    throw new DomainValidationError("Please enter a valid email");
  }

  return Object.freeze({
    value: normalizedValue,
    toPrimitives() {
      return normalizedValue;
    },
    toString() {
      return normalizedValue;
    },
  });
};
