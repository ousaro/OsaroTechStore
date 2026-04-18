import { ApiError } from "../../../../shared/domain/errors/ApiError.js";

export const createProduct = ({ ownerId, payload }) => {
  const {
    name,
    description,
    raw_price,
    discount,
    image,
    otherImages,
    categoryId,
    category,
    countInStock,
    moreInformations,
  } = payload;

  const emptyFields = [];
  if (!name) emptyFields.push("name");
  if (!description) emptyFields.push("description");
  if (!raw_price) emptyFields.push("raw_price");
  if (!discount) emptyFields.push("discount");
  if (!image) emptyFields.push("image");
  if (!otherImages) emptyFields.push("otherImages");
  if (!categoryId) emptyFields.push("categoryId");
  if (!category) emptyFields.push("category");
  if (!countInStock) emptyFields.push("countInStock");
  if (!moreInformations) emptyFields.push("moreInformations");

  if (emptyFields.length > 0) {
    throw new ApiError("Please fill in all the fields", 400, { meta: { emptyFields } });
  }

  if (raw_price < 0 || countInStock < 0) {
    throw new ApiError("Price and countInStock cannot be negative", 400);
  }

  const props = {
    ownerId,
    name,
    description,
    price: raw_price - (raw_price * discount) / 100,
    raw_price,
    discount,
    image,
    otherImages,
    categoryId,
    category,
    countInStock,
    moreInformations,
    rating: "0",
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return { ...props };
    },
  });
};

export const createProductUpdatePatch = (updates) => {
  const patch = { ...updates };

  if (patch.raw_price !== undefined && patch.raw_price < 0) {
    throw new ApiError("Price and countInStock cannot be negative", 400);
  }
  if (patch.countInStock !== undefined && patch.countInStock < 0) {
    throw new ApiError("Price and countInStock cannot be negative", 400);
  }

  if (patch.raw_price !== undefined && patch.discount !== undefined) {
    patch.price = patch.raw_price - (patch.raw_price * patch.discount) / 100;
  }

  return Object.freeze({
    toPrimitives() {
      return { ...patch };
    },
  });
};
