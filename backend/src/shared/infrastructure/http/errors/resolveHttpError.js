import { HTTP_STATUS_BY_ERROR_TYPE } from "./httpErrorCodes.js";

export const resolveHttpError = (error) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return {
      statusCode: 400,
      body: { error: "Malformed JSON request body" },
    };
  }

  const type = error.code || "SYSTEM";
  const statusCode = HTTP_STATUS_BY_ERROR_TYPE[type] || error.statusCode || 500;

  const body = {
    error: error.message || "Unexpected server error",
  };

  if (error.meta) {
    Object.assign(body, error.meta);
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    body.stack = error.stack;
  }

  return { statusCode, body };
};