
export class OrderPlacedEventNotMatched extends Error {
  constructor(message, options = {}) {
    super(message, { code: "ORDER_PLACED_EVENT_NOT_MATCHED", ...options });
  }
}
