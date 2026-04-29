// Category domain entity
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const createCategory = ({ _id, name, description = "" }) => {
  assertNonEmptyString(name, "name");
  return Object.freeze({
    _id, name, description,
    toPrimitives: () => ({ _id, name, description }),
  });
};
