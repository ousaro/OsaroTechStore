import { describe, it } from "mocha";
import { expect } from "chai";
import { toOrderRecord } from "../../../modules/orders/adapters/output/persistence/orderRecordMapper.js";

describe("order record mapper", () => {
  it("maps a raw order into a stable repository record shape", () => {
    const rawOrder = {
      _id: "507f1f77bcf86cd799439012",
      ownerId: "user-1",
      products: [{ productId: "prod-1", qty: 2 }],
      totalPrice: 250,
      status: "pending",
      address: {
        city: "Casablanca",
        addressLine: "123 Main St",
        postalCode: "20000",
        country: "Morocco",
      },
      paymentMethod: "card",
      paymentStatus: "pending",
      paymentReference: "pay_123",
      createdAt: "ignore-me",
      updatedAt: "ignore-me-too",
      save: () => {},
    };

    expect(toOrderRecord(rawOrder)).to.deep.equal({
      _id: "507f1f77bcf86cd799439012",
      ownerId: "user-1",
      products: [{ productId: "prod-1", qty: 2 }],
      totalPrice: 250,
      status: "pending",
      address: {
        city: "Casablanca",
        addressLine: "123 Main St",
        postalCode: "20000",
        country: "Morocco",
      },
      paymentMethod: "card",
      paymentStatus: "pending",
      paymentReference: "pay_123",
    });
  });

  it("returns null when no raw order is provided", () => {
    expect(toOrderRecord(null)).to.equal(null);
  });
});
