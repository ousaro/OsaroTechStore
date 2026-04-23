import { describe, it } from "mocha";
import { expect } from "chai";
import { toOrderReadModel } from "../../../modules/orders/application/read-models/orderReadModel.js";

describe("order read model", () => {
  it("keeps the stable order API shape", () => {
    expect(
      toOrderReadModel({
        _id: "o1",
        ownerId: "u1",
        products: [{ productId: "p1", qty: 1 }],
        totalPrice: 100,
        status: "pending",
        address: { city: "Casablanca" },
        paymentMethod: "card",
        paymentStatus: "pending",
        paymentReference: "pay_123",
        transactionId: "legacy",
      })
    ).to.deep.equal({
      _id: "o1",
      ownerId: "u1",
      products: [{ productId: "p1", qty: 1 }],
      totalPrice: 100,
      status: "pending",
      address: { city: "Casablanca" },
      paymentMethod: "card",
      paymentStatus: "pending",
      paymentReference: "pay_123",
    });
  });
});
