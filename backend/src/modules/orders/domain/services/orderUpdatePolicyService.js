import { assertObject } from "../../../../shared/infrastructure/assertions";
import { ImmutableFiledsAfterOrderPlacementError } from "../errors/ImmutableFiledsAfterOrderPlacementError.js";
import { prepareOrderLifecyclePatch } from "./orderLifecycleService.js";

const IMMUTABLE_ORDER_FIELDS_AFTER_PLACEMENT = new Set([
  "ownerId",
  "products",
  "totalPrice",
  "address",
  "paymentMethod",
  "paymentReference",
]);

export const prepareOrderUpdatePatch = ({ currentOrder, updates }) => {
  assertObject(currentOrder, "currentOrder")

  assertObject(updates, "updates")

  const immutableField = Object.keys(updates).find((fieldName) =>
    IMMUTABLE_ORDER_FIELDS_AFTER_PLACEMENT.has(fieldName)
  );

  if (immutableField) {
    throw new ImmutableFiledsAfterOrderPlacementError(
      `${immutableField} is immutable after order placement`
    );
  }

  return prepareOrderLifecyclePatch({
    currentOrder,
    updates,
  });
};
