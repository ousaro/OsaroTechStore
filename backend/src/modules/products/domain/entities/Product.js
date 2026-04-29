/**
 * Product Domain Entity.
 */
import { assertNonEmptyString, assertPositiveNumber, assertNonNegativeNumber }
  from "../../../../shared/kernel/assertions/index.js";
import { DomainValidationError }
  from "../../../../shared/domain/errors/index.js";

export const PRODUCT_STATUSES = Object.freeze({
  NEW:        "new",
  ACTIVE:     "active",
  INACTIVE:   "inactive",
  DEPRECATED: "deprecated",
});

const ALLOWED_STATUSES = new Set(Object.values(PRODUCT_STATUSES));

export const createProduct = ({
  _id,
  name,
  description,
  price,
  currency = "USD",
  category,
  stock      = 0,
  images     = [],
  status     = PRODUCT_STATUSES.NEW,
}) => {
  assertNonEmptyString(name,     "name");
  assertNonEmptyString(category, "category");
  assertPositiveNumber(price,    "price");
  assertNonNegativeNumber(stock, "stock");

  if (!ALLOWED_STATUSES.has(status)) {
    throw new DomainValidationError(
      `Invalid product status "${status}". Allowed: ${[...ALLOWED_STATUSES].join(", ")}`
    );
  }

  return Object.freeze({
    _id,
    name,
    description: description ?? "",
    price,
    currency,
    category,
    stock,
    images,
    status,

    toPrimitives() {
      return { _id, name, description, price, currency, category, stock, images, status };
    },
  });
};
