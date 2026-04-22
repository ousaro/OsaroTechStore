import { assertRequiredFields } from "../validation/orderValidation.js";

export const createAddress = ({ city, addressLine, postalCode, country }) => {
  const props = {
    city,
    addressLine,
    postalCode,
    country,
  };

  assertRequiredFields(
    props,
    ["city", "addressLine", "postalCode", "country"],
    "Invalid address format"
  );

  return Object.freeze({
    ...props,
    toPrimitives() {
      return { ...props };
    },
  });
};
