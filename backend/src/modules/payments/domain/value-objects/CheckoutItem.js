import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const assertPositiveNumber = (value, message) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new DomainValidationError(message);
  }
};

const assertString = (value, message) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new DomainValidationError(message);
  }
};

export const createCheckoutItem = ({ name, price, quantity }) => {
  assertString(name, "item.name is required");
  assertPositiveNumber(price, "item.price must be a positive number");
  assertPositiveNumber(quantity, "item.quantity must be a positive number");

  const props = {
    name: name.trim(),
    price,
    quantity,
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return { ...props };
    },
  });
};

export const createCheckoutItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new DomainValidationError("items must be a non-empty array");
  }

  return items.map((item, index) => {
    try {
      return createCheckoutItem(item);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        throw new DomainValidationError(`Invalid item at index ${index}: ${error.message}`);
      }

      throw error;
    }
  });
};
