export class ApplicationError extends Error {
  constructor(message, { code = "APPLICATION_ERROR", meta } = {}) {
    super(message);
    this.name = new.target.name;
    this.code = code;

    if (meta) {
      this.meta = meta;
    }
  }
}
