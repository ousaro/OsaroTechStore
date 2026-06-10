export class CartLine {
  constructor(raw) {
    this.productId = raw.productId || raw._id || raw.id || raw.product?._id || raw.product?.id;
    this._id = this.productId;
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

  get lines() {
    return this.#lines;
  }
  get count() {
    return this.#lines.reduce((s, l) => s + l.quantity, 0);
  }
  get isEmpty() {
    return this.#lines.length === 0;
  }

  add(productId, qty = 1) {
    const existing = this.#lines.find((l) => l.productId === productId);
    const newLines = existing
      ? this.#lines.map((l) =>
          l.productId === productId
            ? new CartLine({ productId: l.productId, quantity: l.quantity + qty })
            : l
        )
      : [...this.#lines, new CartLine({ productId, quantity: qty })];
    return new Cart(newLines);
  }

  remove(productId) {
    return new Cart(this.#lines.filter((l) => l.productId !== productId));
  }

  setQty(productId, qty) {
    if (qty <= 0) return this.remove(productId);
    return new Cart(
      this.#lines.map((l) =>
        l.productId === productId ? new CartLine({ productId: l.productId, quantity: qty }) : l
      )
    );
  }

  clear() {
    return new Cart([]);
  }

  toJSON() {
    return this.#lines.map((l) => ({ productId: l.productId, quantity: l.quantity }));
  }

  static fromRaw(lines = []) {
    return new Cart(lines);
  }
}
