import { ApiError } from "../../../../shared/domain/errors/ApiError.js";

export const assertRequiredFields = (payload, requiredFields, message = "Missing required fields") => {
  const emptyFields = requiredFields.filter((field) => !payload?.[field]);
  if (emptyFields.length > 0) {
    throw new ApiError(message, 400, {
      responseKey: "message",
      meta: { emptyFields },
    });
  }
};

export const assertNonEmptyArray = (value, message = "Expected a non-empty array") => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiError(message, 400, { responseKey: "message" });
  }
};

export const assertPositiveNumber = (value, message = "Value must be a positive number") => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new ApiError(message, 400, { responseKey: "message" });
  }
};

export const assertString = (value, message = "Expected a non-empty string") => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError(message, 400, { responseKey: "message" });
  }
};
