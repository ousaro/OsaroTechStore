import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const isMissingValue = (value) => value === undefined || value === null || value === "";
const calculateDiscountedPrice = ({ rawPrice, discount }) => rawPrice - (rawPrice * discount) / 100;

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
  if (isMissingValue(name)) emptyFields.push("name");
  if (isMissingValue(description)) emptyFields.push("description");
  if (isMissingValue(raw_price)) emptyFields.push("raw_price");
  if (isMissingValue(discount)) emptyFields.push("discount");
  if (isMissingValue(image)) emptyFields.push("image");
  if (isMissingValue(otherImages)) emptyFields.push("otherImages");
  if (isMissingValue(categoryId)) emptyFields.push("categoryId");
  if (isMissingValue(category)) emptyFields.push("category");
  if (isMissingValue(countInStock)) emptyFields.push("countInStock");
  if (isMissingValue(moreInformations)) emptyFields.push("moreInformations");

  if (emptyFields.length > 0) {
    throw new DomainValidationError("Please fill in all the fields", { meta: { emptyFields } });
  }

  if (raw_price < 0 || countInStock < 0) {
    throw new DomainValidationError("Price and countInStock cannot be negative");
  }

  const props = {
    ownerId,
    name,
    description,
    price: calculateDiscountedPrice({ rawPrice: raw_price, discount }),
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

export const createProductUpdatePatch = (updates, currentProduct = {}) => {
  const patch = { ...updates };

  if (patch.raw_price !== undefined && patch.raw_price < 0) {
    throw new DomainValidationError("Price and countInStock cannot be negative");
  }
  if (patch.countInStock !== undefined && patch.countInStock < 0) {
    throw new DomainValidationError("Price and countInStock cannot be negative");
  }

  if (patch.raw_price !== undefined || patch.discount !== undefined) {
    const nextRawPrice =
      patch.raw_price !== undefined ? patch.raw_price : currentProduct.raw_price;
    const nextDiscount =
      patch.discount !== undefined ? patch.discount : currentProduct.discount;

    if (nextRawPrice !== undefined && nextDiscount !== undefined) {
      patch.price = calculateDiscountedPrice({
        rawPrice: nextRawPrice,
        discount: nextDiscount,
      });
    }
  }

  return Object.freeze({
    toPrimitives() {
      return { ...patch };
    },
  });
};
