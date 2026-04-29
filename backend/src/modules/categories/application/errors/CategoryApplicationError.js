import { ApplicationNotFoundError } from "../../../../shared/application/errors/index.js";
export class CategoryNotFoundError extends ApplicationNotFoundError {
  constructor(message) { super(message); }
}
