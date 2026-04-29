/**
 * OrderLine Value Object.
 * Represents a single line item in an order.
 * Computes its own subtotal via Money.multiply().
 */
import { DomainValidationError }  from "../../../../shared/domain/errors/index.js";
import { assertNonEmptyString, assertPositiveNumber } from "../../../../shared/kernel/assertions/index.js";
import { createMoney }            from "./Money.js";

export const createOrderLine = ({ productId, name, price, currency, quantity }) => {
  assertNonEmptyString(productId, "productId");
  assertNonEmptyString(name,      "name");
  assertPositiveNumber(quantity,  "quantity");

  const unitPrice = createMoney({ amount: price, currency });
  const subtotal  = unitPrice.multiply(quantity);

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
        subtotal:  subtotal.toPrimitives(),
      };
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Address Value Object.
 */
export const createAddress = ({ street, city, state, postalCode, country }) => {
  assertNonEmptyString(street,     "street");
  assertNonEmptyString(city,       "city");
  assertNonEmptyString(country,    "country");

  return Object.freeze({
    street,
    city,
    state:      state      ?? "",
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
