export class ApiError extends Error {
  constructor(message, statusCode = 500, options = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.meta = options.meta || null;
  }
}
