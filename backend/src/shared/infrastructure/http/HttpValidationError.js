export class HttpValidationError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "HttpValidationError";
    this.code = "HTTP_VALIDATION";

    if (options.meta) {
      this.meta = options.meta;
    }
  }
}
