import { Money } from "../../../../shared/domain/value-objects/Money.js";

export class Product {
  constructor(raw) {
    this.id          = raw._id;
    this.name        = raw.name        || "";
    this.description = raw.description || "";
    this.price       = Money.fromRaw({ amount: raw.price, currency: raw.currency || "USD" });
    this.category    = raw.category    || "";
    this.stock       = Number(raw.stock ?? 0);
    this.images      = Array.isArray(raw.images) ? raw.images : [];
    this.status      = raw.status      || "active";
    this.createdAt   = raw.createdAt;
    this.updatedAt   = raw.updatedAt;
    Object.freeze(this);
  }

  get primaryImage() { return this.images[0] || null; }
  get inStock()      { return this.stock > 0; }
  get lowStock()     { return this.stock > 0 && this.stock <= 5; }

  toJSON() {
    return {
      _id: this.id, name: this.name, description: this.description,
      price: this.price.amount, currency: this.price.currency,
      category: this.category, stock: this.stock, images: this.images,
      status: this.status, createdAt: this.createdAt,
    };
  }
}

export const PRODUCT_STATUSES = ["new", "active", "inactive", "deprecated"];
