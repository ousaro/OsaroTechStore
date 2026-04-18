import { describe, it } from "mocha";
import { expect } from "chai";
import { createOrder, createOrderUpdatePatch } from "../../../../src/modules/orders/domain/entities/Order.js";

describe("Order Domain", () => {
  it("creates a valid order aggregate", () => {
    const order = createOrder({
      ownerId: "u1",
      products: [{ productId: "p1", qty: 1 }],
      totalPrice: 100,
      status: "pending",
      address: {
        city: "Casablanca",
        addressLine: "Street 1",
        postalCode: "20000",
        country: "MA",
      },
      paymentMethod: "card",
      paymentStatus: "pending",
      transactionId: "tx-1",
      paymentDetails: { provider: "stripe" },
    });

    expect(order.toPrimitives().ownerId).to.equal("u1");
    expect(order.toPrimitives().totalPrice).to.equal(100);
  });

  it("throws for invalid address", () => {
    expect(() =>
      createOrder({
        ownerId: "u1",
        products: [{ productId: "p1", qty: 1 }],
        totalPrice: 100,
        status: "pending",
        address: { city: "Casablanca" },
        paymentMethod: "card",
        paymentStatus: "pending",
        transactionId: "tx-1",
        paymentDetails: { provider: "stripe" },
      })
    ).to.throw("Invalid address format");
  });

  it("creates an update patch for valid partial updates", () => {
    const patch = createOrderUpdatePatch({
      status: "paid",
      totalPrice: 150,
    });

    expect(patch.toPrimitives()).to.deep.equal({
      status: "paid",
      totalPrice: 150,
    });
  });

  it("throws when an update patch contains an invalid address", () => {
    expect(() =>
      createOrderUpdatePatch({
        address: { city: "Casablanca" },
      })
    ).to.throw("Invalid address format");
  });
});
