/**
 * Money Value Object.
 *
 * Fixed from original:
 *  - Currency is now mandatory. Money(100) was meaningless — 100 of what?
 *  - Supports add() for totaling order lines (same currency only).
 *  - toPrimitives() returns { amount, currency } not just a number.
 *  - Immutable via Object.freeze().
 *
 * Usage:
 *   const price = createMoney({ amount: 99.99, currency: "USD" });
 *   const total = price.add(createMoney({ amount: 5.00, currency: "USD" }));
 *   total.toPrimitives() // { amount: 104.99, currency: "USD" }
 */

import { DomainValidationError } from "../../../../shared/domain/errors/index.js";
import { assertPositiveNumber }   from "../../../../shared/kernel/assertions/index.js";

const ALLOWED_CURRENCIES = new Set(["USD", "EUR", "MAD", "GBP", "CAD", "AED"]);

export const createMoney = ({ amount, currency }) => {
  assertPositiveNumber(amount, "amount");

  if (typeof currency !== "string" || currency.trim() === "") {
    throw new DomainValidationError("currency must be a non-empty string");
  }

  const normalizedCurrency = currency.trim().toUpperCase();

  if (!ALLOWED_CURRENCIES.has(normalizedCurrency)) {
    throw new DomainValidationError(
      `Unsupported currency "${normalizedCurrency}". ` +
        `Allowed: ${[...ALLOWED_CURRENCIES].join(", ")}`
    );
  }

  const self = Object.freeze({
    amount,
    currency: normalizedCurrency,

    add(other) {
      if (other.currency !== normalizedCurrency) {
        throw new DomainValidationError(
          `Cannot add ${other.currency} to ${normalizedCurrency}`
        );
      }
      // Round to 2 decimal places to avoid floating-point drift
      return createMoney({
        amount: Math.round((amount + other.amount) * 100) / 100,
        currency: normalizedCurrency,
      });
    },

    multiply(factor) {
      if (typeof factor !== "number" || factor < 0) {
        throw new DomainValidationError("factor must be a non-negative number");
      }
      return createMoney({
        amount: Math.round(amount * factor * 100) / 100,
        currency: normalizedCurrency,
      });
    },

    equals(other) {
      return other?.amount === amount && other?.currency === normalizedCurrency;
    },

    toPrimitives() {
      return { amount, currency: normalizedCurrency };
    },

    toString() {
      return `${normalizedCurrency} ${amount.toFixed(2)}`;
    },
  });

  return self;
};
