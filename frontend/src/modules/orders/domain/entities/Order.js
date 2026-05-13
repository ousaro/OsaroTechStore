// src/modules/orders/domain/entities/Order.js
import { Money } from "../../../../shared/domain/value-objects/Money.js";
import { Address } from "../../../../shared/domain/value-objects/Address.js";

export class OrderLine {
  constructor(raw) {
    this.productId = raw.productId;
    this.name      = raw.name;
    this.quantity  = raw.quantity;
    this.unitPrice = Money.fromRaw(raw.unitPrice || { amount: raw.price, currency: "USD" });
    this.subtotal  = Money.fromRaw(raw.subtotal  || { amount: raw.price * raw.quantity, currency: "USD" });
    Object.freeze(this);
  }
}

export class Order {
  constructor(raw) {
    this.id              = raw._id;
    this.ownerId         = raw.ownerId;
    this.orderLines      = (raw.orderLines || []).map((l) => new OrderLine(l));
    this.deliveryAddress = Address.fromRaw(raw.deliveryAddress || {});
    this.currency        = raw.currency    || "USD";
    this.orderStatus     = raw.orderStatus || "pending";
    this.paymentStatus   = raw.paymentStatus || "pending";
    this.totalPrice      = Money.fromRaw(raw.totalPrice);
    this.createdAt       = raw.createdAt;
    Object.freeze(this);
  }
}

export const ORDER_STATUSES   = ["pending","processing","shipped","delivered","cancelled"];
export const PAYMENT_STATUSES = ["pending","paid","failed","expired","refunded"];
