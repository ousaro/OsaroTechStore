import { describe, it } from "mocha";
import { expect } from "chai";
import { assertApplicationEvent } from "../../../src/shared/application/contracts/applicationEventContract.js";

describe("application event contract", () => {
  it("accepts a fully correlated OrderPlaced event", () => {
    expect(() =>
      assertApplicationEvent({
        type: "OrderPlaced",
        payload: {
          orderId: "o1",
          ownerId: "u1",
          status: "pending",
          paymentStatus: "pending",
          paymentReference: "pay_123",
          totalPrice: 100,
        },
      })
    ).to.not.throw();
  });

  it("rejects PaymentConfirmed events without correlation data", () => {
    expect(() =>
      assertApplicationEvent({
        type: "PaymentConfirmed",
        payload: {
          sessionId: "cs_123",
          paymentStatus: "paid",
        },
      })
    ).to.throw("event.payload.paymentReference is required");
  });
});
