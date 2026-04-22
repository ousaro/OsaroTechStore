import { describe, it } from "mocha";
import { expect } from "chai";
import { createOrder, createOrderUpdatePatch } from "../../../../src/modules/orders/domain/entities/Order.js";
import { createAddress } from "../../../../src/modules/orders/domain/value-objects/Address.js";
import { createMoney } from "../../../../src/modules/orders/domain/value-objects/Money.js";
import { createOrderStatus } from "../../../../src/modules/orders/domain/value-objects/OrderStatus.js";
import { createPaymentStatus } from "../../../../src/modules/orders/domain/value-objects/PaymentStatus.js";
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
    expect(order.toPrimitives().status).to.equal("pending");
    expect(order.toPrimitives().paymentStatus).to.equal("pending");
    expect(order.totalPrice.toPrimitives()).to.equal(100);
    expect(order.status.toPrimitives()).to.equal("pending");
    expect(order.paymentStatus.toPrimitives()).to.equal("pending");
    expect(order.address.toPrimitives()).to.deep.equal({
      city: "Casablanca",
      addressLine: "Street 1",
      postalCode: "20000",
      country: "MA",
    });
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
      paymentStatus: "paid",
    });

    expect(patch.toPrimitives()).to.deep.equal({
      status: "paid",
      totalPrice: 150,
      paymentStatus: "paid",
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

  it("creates an address value object with stable primitives", () => {
    const address = createAddress({
      city: "Casablanca",
      addressLine: "Street 1",
      postalCode: "20000",
      country: "MA",
    });

    expect(address.toPrimitives()).to.deep.equal({
      city: "Casablanca",
      addressLine: "Street 1",
      postalCode: "20000",
      country: "MA",
    });
  });

  it("creates a money value object with stable primitives", () => {
    const money = createMoney(150);

    expect(money.toPrimitives()).to.equal(150);
  });

  it("creates order and payment status value objects with stable primitives", () => {
    const orderStatus = createOrderStatus("Processing");
    const paymentStatus = createPaymentStatus("Paid");

    expect(orderStatus.toPrimitives()).to.equal("processing");
    expect(paymentStatus.toPrimitives()).to.equal("paid");
  });

  it("throws for invalid order or payment status values", () => {
    expect(() => createOrderStatus("unknown")).to.throw(DomainValidationError, "Invalid order status");
    expect(() => createPaymentStatus("unknown")).to.throw(
      DomainValidationError,
      "Invalid payment status"
    );
  });
});
