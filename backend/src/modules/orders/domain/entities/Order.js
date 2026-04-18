import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import {
  assertRequiredFields,
  assertNonEmptyArray,
  assertPositiveNumber,
  assertString,
} from "../../../../shared/infrastructure/http/validation.js";

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

  try {
    assertRequiredFields(address, ["city", "addressLine", "postalCode", "country"], "Invalid address format");
  } catch (_error) {
    throw new ApiError("Invalid address format", 400, { responseKey: "message" });
  }

  if (!paymentDetails || typeof paymentDetails !== "object") {
    throw new ApiError("paymentDetails is required", 400);
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
