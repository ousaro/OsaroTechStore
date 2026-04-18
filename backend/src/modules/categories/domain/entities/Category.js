import { ApiError } from "../../../../shared/domain/errors/ApiError.js";

export const createCategory = ({ name, description, image }) => {
  const emptyFields = [];
  if (!name) emptyFields.push("name");
  if (!description) emptyFields.push("description");
  if (!image) emptyFields.push("image");

  if (emptyFields.length > 0) {
    throw new ApiError("Please fill in all the fields", 400, {
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
