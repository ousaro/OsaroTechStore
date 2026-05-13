/**
 * SHARED DOMAIN — Domain Event base class
 *
 * Frontend equivalent of the backend's event bus pattern.
 * Modules emit typed events; other modules subscribe through translators
 * wired in the composition root — never via direct import.
 */

export class DomainEvent {
  constructor(type, payload) {
    this.type      = type;
    this.payload   = payload;
    this.occurredAt = new Date().toISOString();
    Object.freeze(this);
  }
}

// ── Known event type constants ─────────────────────────────────
export const Events = Object.freeze({
  // Auth
  USER_LOGGED_IN:    "auth/UserLoggedIn",
  USER_LOGGED_OUT:   "auth/UserLoggedOut",
  USER_REGISTERED:   "auth/UserRegistered",

  // Cart
  CART_UPDATED:      "cart/CartUpdated",

  // Products
  PRODUCT_CREATED:   "products/ProductCreated",
  PRODUCT_UPDATED:   "products/ProductUpdated",
  PRODUCT_DELETED:   "products/ProductDeleted",

  // Categories
  CATEGORY_CREATED:  "categories/CategoryCreated",
  CATEGORY_DELETED:  "categories/CategoryDeleted",

  // Orders
  ORDER_PLACED:      "orders/OrderPlaced",
  ORDER_UPDATED:     "orders/OrderUpdated",

  // Payments
  PAYMENT_INITIATED: "payments/PaymentInitiated",
});
