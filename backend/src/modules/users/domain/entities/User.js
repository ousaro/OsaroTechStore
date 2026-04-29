// User domain entity
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const createUser = ({ _id, firstName, lastName, email, phone = "",
  address = "", city = "", country = "", state = "", postalCode = 0,
  favorites = [], cart = [], picture = "" }) => {
  assertNonEmptyString(firstName, "firstName");
  assertNonEmptyString(lastName,  "lastName");
  assertNonEmptyString(email,     "email");
  return Object.freeze({
    _id, firstName, lastName, email, phone, address, city, country,
    state, postalCode, favorites, cart, picture,
    toPrimitives: () => ({ _id, firstName, lastName, email, phone, address,
      city, country, state, postalCode, favorites, cart, picture }),
  });
};
