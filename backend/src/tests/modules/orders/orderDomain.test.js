import { describe, it } from "mocha";
import { expect } from "chai";
import { createOrder, createOrderUpdatePatch } from "../../../../src/modules/orders/domain/entities/Order.js";
import { DomainValidationError } from "../../../../src/shared/domain/errors/DomainValidationError.js";

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
    try {
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
      });
      expect.fail("Expected createOrder to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(DomainValidationError);
      expect(error.message).to.equal("Invalid address format");
      expect(error.meta).to.deep.equal({
        emptyFields: ["addressLine", "postalCode", "country"],
      });
    }
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
    try {
      createOrderUpdatePatch({
        address: { city: "Casablanca" },
      });
      expect.fail("Expected createOrderUpdatePatch to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(DomainValidationError);
      expect(error.message).to.equal("Invalid address format");
      expect(error.meta).to.deep.equal({
        emptyFields: ["addressLine", "postalCode", "country"],
      });
    }
  });
});
