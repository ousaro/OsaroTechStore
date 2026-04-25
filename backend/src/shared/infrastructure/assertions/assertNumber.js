export const assertNumber = (value, fieldName) => {
    if (typeof value !== "number") {
        throw new Error(`${fieldName} must be a number`);
    }
};