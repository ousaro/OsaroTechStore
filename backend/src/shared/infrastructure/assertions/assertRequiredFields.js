
export const assertRequiredFields = (payload, requiredFields, fieldName) => {
  const emptyFields = requiredFields.filter((field) => !payload?.[field]);
  if (emptyFields.length > 0) {
    throw new Error(`Missing required fields in ${fieldName}`, { meta: { emptyFields } });
  }
};
