import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export const createCategory = ({ name, description, image }) => {
  const emptyFields = [];
  if (!name) emptyFields.push("name");
  if (!description) emptyFields.push("description");
  if (!image) emptyFields.push("image");

  if (emptyFields.length > 0) {
    throw new DomainValidationError("Please fill in all the fields", {
      meta: { emptyFields },
    });
  }

  const props = {
    name,
    description,
    image,
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return { ...props };
    },
  });
};
