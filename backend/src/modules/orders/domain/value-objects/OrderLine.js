import { DomainValidationError } from "../../../../shared/domain/errors/index.js";
import {
  assertNonEmptyString,
  assertPositiveNumber,
} from "../../../../shared/kernel/assertions/index.js";
import { createMoney } from "./Money.js";

export const createOrderLine = ({ productId, name, price, currency, quantity }) => {
  try {
    assertNonEmptyString(productId, "productId");
    assertNonEmptyString(name, "name");
    assertPositiveNumber(quantity, "quantity");
  } catch (error) {
    throw new DomainValidationError(error.message);
  }

  const unitPrice = createMoney({ amount: price, currency });
  const subtotal = unitPrice.multiply(quantity);

  return Object.freeze({
    productId,
    name,
    quantity,
    unitPrice,
    subtotal,

    toPrimitives() {
      return {
        productId,
        name,
        quantity,
        unitPrice: unitPrice.toPrimitives(),
        subtotal: subtotal.toPrimitives(),
      };
    },
  });
};

export const createAddress = ({ street, city, state, postalCode, country }) => {
  try {
    assertNonEmptyString(street, "street");
    assertNonEmptyString(city, "city");
    assertNonEmptyString(country, "country");
  } catch (error) {
    throw new DomainValidationError(error.message);
  }

  return Object.freeze({
    street,
    city,
    state: state ?? "",
    postalCode: postalCode ?? "",
    country,

    toPrimitives() {
      return { street, city, state, postalCode, country };
    },

    toString() {
      return [street, city, state, postalCode, country].filter(Boolean).join(", ");
    },
  });
};
