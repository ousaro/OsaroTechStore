export class Address {
  constructor({ street = "", city = "", state = "", postalCode = "", country = "", phone = "" } = {}) {
    this.street     = street;
    this.city       = city;
    this.state      = state;
    this.postalCode = postalCode;
    this.country    = country;
    this.phone      = phone;
    Object.freeze(this);
  }

  get isEmpty() {
    return !this.street && !this.city && !this.country;
  }

  toString() {
    return [this.street, this.city, this.state, this.country].filter(Boolean).join(", ");
  }

  toJSON() {
    return { street: this.street, city: this.city, state: this.state, postalCode: this.postalCode, country: this.country, phone: this.phone };
  }

  static fromRaw(raw = {}) {
    return new Address(raw);
  }
}
