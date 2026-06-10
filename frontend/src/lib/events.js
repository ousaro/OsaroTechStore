export class DomainEvent {
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
    this.occurredAt = new Date().toISOString();
    Object.freeze(this);
  }
}

export const Events = Object.freeze({
  USER_LOGGED_IN: "auth/UserLoggedIn",
  USER_LOGGED_OUT: "auth/UserLoggedOut",
  USER_REGISTERED: "auth/UserRegistered",

  CART_UPDATED: "cart/CartUpdated",

  PRODUCT_CREATED: "products/ProductCreated",
  PRODUCT_UPDATED: "products/ProductUpdated",
  PRODUCT_DELETED: "products/ProductDeleted",

  CATEGORY_CREATED: "categories/CategoryCreated",
  CATEGORY_UPDATED: "categories/CategoryUpdated",
  CATEGORY_DELETED: "categories/CategoryDeleted",

  ORDER_PLACED: "orders/OrderPlaced",
  ORDER_UPDATED: "orders/OrderUpdated",

  PAYMENT_INITIATED: "payments/PaymentInitiated",
});
