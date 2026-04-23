const STATUS_BY_ERROR_CODE = Object.freeze({
  AUTH_CONFLICT: 400,
  AUTH_UNAUTHORIZED: 401,
  AUTH_VALIDATION: 400,
  CATEGORY_NOT_FOUND: 404,
  CATEGORY_VALIDATION: 400,
  DOMAIN_VALIDATION: 400,
  HTTP_VALIDATION: 400,
  ORDER_NOT_FOUND: 404,
  PAYMENT_VALIDATION: 400,
  PAYMENT_WEBHOOK_ERROR: 400,
  PRODUCT_NOT_FOUND: 404,
  SERVICE_UNAVAILABLE: 503,
  USER_NOT_FOUND: 404,
  USER_VALIDATION: 400,
});

export const resolveHttpError = (error) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return {
      statusCode: 400,
      body: { error: "Malformed JSON request body" },
    };
  }

  const statusCode = STATUS_BY_ERROR_CODE[error.code] || error.statusCode || 500;
  const body = { error: error.message || "Unexpected server error" };

  if (error.meta) {
    Object.assign(body, error.meta);
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    body.stack = error.stack;
  }

  return { statusCode, body };
};
