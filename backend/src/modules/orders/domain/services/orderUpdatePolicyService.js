import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { prepareOrderLifecyclePatch } from "./orderLifecycleService.js";

const IMMUTABLE_ORDER_FIELDS_AFTER_PLACEMENT = new Set([
  "ownerId",
  "products",
  "totalPrice",
  "address",
  "paymentMethod",
  "paymentReference",
  "transactionId",
  "paymentDetails",
]);

export const prepareOrderUpdatePatch = ({ currentOrder, updates }) => {
  if (!currentOrder || typeof currentOrder !== "object") {
    throw new Error("currentOrder is required");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("updates are required");
  }

  const immutableField = Object.keys(updates).find((fieldName) =>
    IMMUTABLE_ORDER_FIELDS_AFTER_PLACEMENT.has(fieldName)
  );

  if (immutableField) {
    throw new DomainValidationError(
      `${immutableField} is immutable after order placement`
    );
  }

  return prepareOrderLifecyclePatch({
    currentOrder,
    updates,
  });
};
