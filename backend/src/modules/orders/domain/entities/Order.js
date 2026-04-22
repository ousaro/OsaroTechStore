import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { createAddress } from "../value-objects/Address.js";
import { createMoney } from "../value-objects/Money.js";
import {
  assertNonEmptyArray,
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
  assertString(status, "status is required");
  assertString(paymentMethod, "paymentMethod is required");
  assertString(transactionId, "transactionId is required");
  const orderAddress = createAddress(address);
  const orderTotalPrice = createMoney(totalPrice);

  if (!paymentDetails || typeof paymentDetails !== "object") {
    throw new DomainValidationError("paymentDetails is required");
  }

  const props = {
    ownerId,
    products,
    totalPrice: orderTotalPrice,
    status,
    address: orderAddress,
    paymentMethod,
    paymentStatus: paymentStatus || "pending",
    transactionId,
    paymentDetails,
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return {
        ...props,
        totalPrice: props.totalPrice.toPrimitives(),
        address: props.address.toPrimitives(),
      };
    },
  });
};

export const createOrderUpdatePatch = (updates) => {
  const patch = { ...updates };

  if (patch.totalPrice !== undefined) {
    patch.totalPrice = createMoney(patch.totalPrice);
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
    patch.address = createAddress(patch.address);
  }

  if (patch.products !== undefined) {
    assertNonEmptyArray(patch.products, "products must be a non-empty array");
  }

  if (patch.paymentDetails !== undefined && (!patch.paymentDetails || typeof patch.paymentDetails !== "object")) {
    throw new DomainValidationError("paymentDetails is required");
  }

  return Object.freeze({
    toPrimitives() {
      return {
        ...patch,
        ...(patch.totalPrice ? { totalPrice: patch.totalPrice.toPrimitives() } : {}),
        ...(patch.address ? { address: patch.address.toPrimitives() } : {}),
      };
    },
  });
};
