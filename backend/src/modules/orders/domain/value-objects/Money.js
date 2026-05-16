
import { DomainValidationError } from "../../../../shared/domain/errors/index.js";
import {
  assertNonEmptyString,
  assertNonNegativeNumber,
  assertPositiveNumber,
} from "../../../../shared/kernel/assertions/index.js";

const ALLOWED_CURRENCIES = new Set(["USD", "EUR", "MAD", "GBP", "CAD", "AED"]);

export const createMoney = ({ amount, currency }) => {
  try {
    assertPositiveNumber(amount, "amount");
  } catch (error) {
    throw new DomainValidationError(error.message);
  }

  try {
    assertNonEmptyString(currency, "currency");
  } catch (_err) {
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
        throw new DomainValidationError(`Cannot add ${other.currency} to ${normalizedCurrency}`);
      }
      return createMoney({
        amount: Math.round((amount + other.amount) * 100) / 100,
        currency: normalizedCurrency,
      });
    },

    multiply(factor) {
      try {
        assertNonNegativeNumber(factor, "factor");
      } catch (_err) {
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
