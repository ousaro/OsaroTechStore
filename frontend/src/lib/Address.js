export class Address {
  constructor({ street = "", city = "", state = "", postalCode = "", country = "" } = {}) {
    this.street     = street;
    this.city       = city;
    this.state      = state;
    this.postalCode = postalCode;
    this.country    = country;
    Object.freeze(this);
  }

  get isEmpty() {
    return !this.street && !this.city && !this.country;
  }

  toString() {
    return [this.street, this.city, this.state, this.country].filter(Boolean).join(", ");
  }

  toJSON() {
    return { street: this.street, city: this.city, state: this.state, postalCode: this.postalCode, country: this.country };
  }

  static fromRaw(raw = {}) {
    return new Address(raw);
  }
}
