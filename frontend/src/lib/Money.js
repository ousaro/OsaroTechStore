export class Money {
  #amount;
  #currency;

  constructor(amount, currency = "USD") {
    this.#amount   = Number(amount);
    this.#currency = currency;
    Object.freeze(this);
  }

  get amount()   { return this.#amount; }
  get currency() { return this.#currency; }

  add(other)      { return new Money(this.#amount + other.amount, this.#currency); }
  multiply(qty)   { return new Money(this.#amount * qty, this.#currency); }

  format() {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.#currency,
    }).format(this.#amount);
  }

  toJSON() { return { amount: this.#amount, currency: this.#currency }; }

  static fromRaw(raw) {
    if (raw instanceof Money) return raw;
    if (typeof raw === "number") return new Money(raw);
    if (raw && typeof raw === "object" && "amount" in raw)
      return new Money(raw.amount, raw.currency);
    return new Money(0);
  }

  static zero(currency = "USD") { return new Money(0, currency); }
}
