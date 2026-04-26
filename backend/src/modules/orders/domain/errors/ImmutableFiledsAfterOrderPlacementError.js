
export class ImmutableFiledsAfterOrderPlacementError extends Error {
  constructor(message, options = {}) {
    super(message, { code: "IMMUTABLE_FIELDS_AFTER_ORDER_PLACEMENT", ...options });
  }
}
