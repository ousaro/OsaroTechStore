export const assertFunction = (value, fieldName) => {
  if (typeof value !== "function") {
    throw new Error(`${fieldName} must be a function`);
  }
}