export const errorMiddleware = (error, req, res, next) => {
  // Handle malformed JSON bodies from express.json()
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "Malformed JSON request body" });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Unexpected server error";
  const responseKey = error.responseKey || "error";
  const body = { [responseKey]: message };

  if (error.meta) {
    Object.assign(body, error.meta);
  }

  if (process.env.NODE_ENV !== "production" && error.stack) body.stack = error.stack;
  return res.status(statusCode).json(body);
};
