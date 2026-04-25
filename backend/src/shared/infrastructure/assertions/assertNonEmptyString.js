export const assertNonEmptyString = (value, fieldName) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} is required`);
  }
};

