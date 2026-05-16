/**
 * CART MODULE — Domain Entity: Cart
 * Encapsulates cart line items and quantity logic.
 */

export class CartLine {
  constructor(raw) {
    this._id      = raw._id;      // product ID
    this.quantity = Number(raw.quantity) || 1;
    Object.freeze(this);
  }
}

export class Cart {
  #lines;

  constructor(lines = []) {
    this.#lines = lines.map((l) => new CartLine(l));
    Object.freeze(this);
  }

  get lines()    { return this.#lines; }
  get count()    { return this.#lines.reduce((s, l) => s + l.quantity, 0); }
  get isEmpty()  { return this.#lines.length === 0; }

  add(productId, qty = 1) {
    const existing = this.#lines.find((l) => l._id === productId);
    const newLines = existing
      ? this.#lines.map((l) => l._id === productId ? new CartLine({ _id: l._id, quantity: l.quantity + qty }) : l)
      : [...this.#lines, new CartLine({ _id: productId, quantity: qty })];
    return new Cart(newLines);
  }

  remove(productId) {
    return new Cart(this.#lines.filter((l) => l._id !== productId));
  }

  setQty(productId, qty) {
    if (qty <= 0) return this.remove(productId);
    return new Cart(this.#lines.map((l) => l._id === productId ? new CartLine({ _id: l._id, quantity: qty }) : l));
  }

  clear() { return new Cart([]); }

  toJSON() { return this.#lines.map((l) => ({ _id: l._id, quantity: l.quantity })); }

  static fromRaw(lines = []) { return new Cart(lines); }
}
