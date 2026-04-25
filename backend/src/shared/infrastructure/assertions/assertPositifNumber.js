export const assertPositiveNumber = (value,fieldName) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new Error(`${fieldName} value must be a positive number`);
  }
};