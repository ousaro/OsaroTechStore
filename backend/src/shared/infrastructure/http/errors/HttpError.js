export class HttpError extends Error {
  constructor(message, { code = "SYSTEM", meta } = {}) {
    super(message);

    this.name = "HttpError";
    this.code = code; // VALIDATION, AUTH, NOT_FOUND, etc.

    if (meta) {
      this.meta = meta;
    }

    Error.captureStackTrace?.(this, this.constructor);
  }
}