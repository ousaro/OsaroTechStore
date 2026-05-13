/**
 * USERS MODULE — Domain Entity: UserProfile
 * Owns profile, address, favorites state.
 * Separate from AuthUser (which only owns identity + token).
 */

export class UserProfile {
  constructor(raw) {
    this.id         = raw._id;
    this.firstName  = raw.firstName  || "";
    this.lastName   = raw.lastName   || "";
    this.email      = raw.email      || "";
    this.picture    = raw.picture    || null;
    this.isAdmin    = Boolean(raw.admin);
    this.phone      = raw.phone      || "";
    this.address    = raw.address    || "";
    this.city       = raw.city       || "";
    this.state      = raw.state      || "";
    this.postalCode = raw.postalCode || "";
    this.country    = raw.country    || "";
    this.favorites  = Array.isArray(raw.favorites) ? raw.favorites : [];
    this.cart       = Array.isArray(raw.cart)      ? raw.cart      : [];
    this.token      = raw.token      || null;
    this.createdAt  = raw.createdAt;
    Object.freeze(this);
  }

  get fullName()  { return `${this.firstName} ${this.lastName}`.trim(); }
  get cartCount() { return this.cart.reduce((s, i) => s + (i.quantity || 1), 0); }

  hasFavorite(productId) { return this.favorites.includes(productId); }

  toJSON() {
    return {
      _id: this.id, firstName: this.firstName, lastName: this.lastName,
      email: this.email, picture: this.picture, admin: this.isAdmin,
      phone: this.phone, address: this.address, city: this.city,
      state: this.state, postalCode: this.postalCode, country: this.country,
      favorites: this.favorites, cart: this.cart, token: this.token,
      createdAt: this.createdAt,
    };
  }
}
