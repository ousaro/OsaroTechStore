export const assertArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }
}