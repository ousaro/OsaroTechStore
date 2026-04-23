import { describe, it } from "mocha";
import { expect } from "chai";
import {
  cancelOrder,
  createOrder,
  createOrderUpdatePatch,
  deliverOrder,
  markOrderAsPaid,
  shipOrder,
  startOrderProcessing,
  transitionOrderStatus,
} from "../../../../src/modules/orders/domain/entities/Order.js";
import { prepareOrderLifecyclePatch } from "../../../../src/modules/orders/domain/services/orderLifecycleService.js";
import { prepareOrderUpdatePatch } from "../../../../src/modules/orders/domain/services/orderUpdatePolicyService.js";
import { createAddress } from "../../../../src/modules/orders/domain/value-objects/Address.js";
import { createMoney } from "../../../../src/modules/orders/domain/value-objects/Money.js";
import { createOrderLine } from "../../../../src/modules/orders/domain/value-objects/OrderLine.js";
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
      paymentReference: "pay_123",
    });

    expect(order.toPrimitives().ownerId).to.equal("u1");
    expect(order.toPrimitives().totalPrice).to.equal(100);
    expect(order.toPrimitives().status).to.equal("pending");
    expect(order.toPrimitives().paymentStatus).to.equal("pending");
    expect(order.toPrimitives().paymentReference).to.equal("pay_123");
    expect(order.toPrimitives().products).to.deep.equal([{ productId: "p1", qty: 1 }]);
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
        paymentReference: "pay_123",
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

  it("creates an update patch for valid lifecycle updates", () => {
    const patch = createOrderUpdatePatch({
      status: "paid",
      paymentStatus: "paid",
    });

    expect(patch.toPrimitives()).to.deep.equal({
      status: "paid",
      paymentStatus: "paid",
    });
  });

  it("keeps only fulfillment-relevant payment fields inside the order aggregate", () => {
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
      paymentReference: "pay_123",
    });

    expect(order.toPrimitives()).to.include({
      paymentMethod: "card",
      paymentStatus: "pending",
      paymentReference: "pay_123",
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

  it("creates an order-line value object with stable primitives", () => {
    const line = createOrderLine({
      productId: "p1",
      qty: 2,
      title: "Phone",
    });

    expect(line.toPrimitives()).to.deep.equal({
      productId: "p1",
      qty: 2,
      title: "Phone",
    });
  });

  it("rejects invalid order lines", () => {
    expect(() => createOrderLine({ productId: "", qty: 0 })).to.throw(
      DomainValidationError,
      "orderLine.productId is required"
    );
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

  it("transitions order status through explicit lifecycle rules", () => {
    const nextStatus = transitionOrderStatus({ status: "pending" }, "paid");

    expect(nextStatus.toPrimitives()).to.equal("paid");
  });

  it("throws for invalid order status transitions", () => {
    expect(() => transitionOrderStatus({ status: "pending" }, "delivered")).to.throw(
      DomainValidationError,
      "Invalid order status transition from pending to delivered"
    );
  });

  it("exposes explicit behaviors for the main order lifecycle steps", () => {
    expect(markOrderAsPaid({ status: "pending" }).toPrimitives()).to.equal("paid");
    expect(startOrderProcessing({ status: "paid" }).toPrimitives()).to.equal(
      "processing"
    );
    expect(shipOrder({ status: "processing" }).toPrimitives()).to.equal("shipped");
    expect(deliverOrder({ status: "shipped" }).toPrimitives()).to.equal("delivered");
    expect(cancelOrder({ status: "pending" }).toPrimitives()).to.equal("cancelled");
  });

  it("prepares lifecycle updates through a dedicated domain service", () => {
    const patch = prepareOrderLifecyclePatch({
      currentOrder: {
        status: "pending",
        paymentStatus: "pending",
      },
      updates: {
        status: "paid",
        paymentStatus: "paid",
      },
    });

    expect(patch).to.deep.equal({
      status: "paid",
      paymentStatus: "paid",
    });
  });

  it("enforces that paid or fulfillment statuses require a paid payment state", () => {
    expect(() =>
      prepareOrderLifecyclePatch({
        currentOrder: {
          status: "pending",
          paymentStatus: "pending",
        },
        updates: {
          status: "paid",
        },
      })
    ).to.throw(
      DomainValidationError,
      "Order status paid requires paymentStatus paid"
    );
  });

  it("rejects immutable order fields after placement", () => {
    expect(() =>
      prepareOrderUpdatePatch({
        currentOrder: {
          status: "pending",
          paymentStatus: "pending",
        },
        updates: {
          paymentMethod: "cash",
        },
      })
    ).to.throw(
      DomainValidationError,
      "paymentMethod is immutable after order placement"
    );
  });
});
