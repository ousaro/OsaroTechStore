import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import {
  assertRequiredFields,
  assertNonEmptyArray,
  assertPositiveNumber,
  assertString,
} from "../validation/orderValidation.js";

export const createOrder = ({
  ownerId,
  products,
  totalPrice,
  status,
  address,
  paymentMethod,
  paymentStatus,
  transactionId,
  paymentDetails,
}) => {
  assertString(ownerId, "ownerId is required");
  assertNonEmptyArray(products, "products must be a non-empty array");
  assertPositiveNumber(totalPrice, "totalPrice must be a positive number");
  assertString(status, "status is required");
  assertString(paymentMethod, "paymentMethod is required");
  assertString(transactionId, "transactionId is required");

  assertRequiredFields(address, ["city", "addressLine", "postalCode", "country"], "Invalid address format");

  if (!paymentDetails || typeof paymentDetails !== "object") {
    throw new DomainValidationError("paymentDetails is required");
  }

  const props = {
    ownerId,
    products,
    totalPrice,
    status,
    address,
    paymentMethod,
    paymentStatus: paymentStatus || "pending",
    transactionId,
    paymentDetails,
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return { ...props };
    },
  });
};

export const createOrderUpdatePatch = (updates) => {
  const patch = { ...updates };

  if (patch.totalPrice !== undefined) {
    assertPositiveNumber(patch.totalPrice, "totalPrice must be a positive number");
  }

  if (patch.status !== undefined) {
    assertString(patch.status, "status is required");
  }

  if (patch.paymentMethod !== undefined) {
    assertString(patch.paymentMethod, "paymentMethod is required");
  }

  if (patch.transactionId !== undefined) {
    assertString(patch.transactionId, "transactionId is required");
  }

  if (patch.address !== undefined) {
    assertRequiredFields(
      patch.address,
      ["city", "addressLine", "postalCode", "country"],
      "Invalid address format"
    );
  }

  if (patch.products !== undefined) {
    assertNonEmptyArray(patch.products, "products must be a non-empty array");
  }

  if (patch.paymentDetails !== undefined && (!patch.paymentDetails || typeof patch.paymentDetails !== "object")) {
    throw new DomainValidationError("paymentDetails is required");
  }

  return Object.freeze({
    toPrimitives() {
      return { ...patch };
    },
  });
};
