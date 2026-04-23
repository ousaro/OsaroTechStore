import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const assertPositiveInteger = (value, fieldName) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new DomainValidationError(`${fieldName} must be a positive integer`);
  }
};

export const createOrderLine = (line) => {
  if (!line || typeof line !== "object") {
    throw new DomainValidationError("order line is required");
  }

  const { productId, qty, ...rest } = line;

  if (typeof productId !== "string" || productId.trim() === "") {
    throw new DomainValidationError("orderLine.productId is required");
  }

  assertPositiveInteger(qty, "orderLine.qty");

  const props = {
    ...rest,
    productId: productId.trim(),
    qty,
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return { ...props };
    },
  });
};

export const createOrderLines = (lines) => {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new DomainValidationError("products must be a non-empty array");
  }

  return Object.freeze(lines.map((line) => createOrderLine(line)));
};
