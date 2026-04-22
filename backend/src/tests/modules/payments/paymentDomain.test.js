import { describe, it } from "mocha";
import { expect } from "chai";
import { DomainValidationError } from "../../../../src/shared/domain/errors/DomainValidationError.js";
import {
  createCheckoutItem,
  createCheckoutItems,
} from "../../../../src/modules/payments/domain/value-objects/CheckoutItem.js";
import { createPaymentSession } from "../../../../src/modules/payments/domain/entities/PaymentSession.js";
import { createCheckoutSessionWorkflow } from "../../../../src/modules/payments/domain/services/paymentSessionWorkflowService.js";

describe("Payment Domain", () => {
  it("creates checkout items and a payment session with stable primitives", () => {
    const item = createCheckoutItem({
      name: "Phone",
      price: 100,
      quantity: 2,
    });
    const session = createPaymentSession({
      id: "cs_test_123",
      paymentReference: "pay_123",
      providerTransactionId: "pi_123",
      url: "https://stripe.test/session",
      paymentStatus: "paid",
    });

    expect(item.toPrimitives()).to.deep.equal({
      name: "Phone",
      price: 100,
      quantity: 2,
    });
    expect(session.toPrimitives()).to.deep.equal({
      id: "cs_test_123",
      paymentReference: "pay_123",
      providerTransactionId: "pi_123",
      url: "https://stripe.test/session",
      paymentStatus: "paid",
    });
  });

  it("throws when checkout items are invalid", () => {
    expect(() => createCheckoutItems([{ name: "", price: -1, quantity: 0 }])).to.throw(
      DomainValidationError,
      "Invalid item at index 0: item.name is required"
    );
  });

  it("models checkout session creation as a payment workflow", () => {
    const session = createCheckoutSessionWorkflow({
      gatewaySession: {
        id: "cs_test_123",
        url: "https://stripe.test/session",
      },
    });

    expect(session.toPrimitives()).to.deep.equal({
      id: "cs_test_123",
      url: "https://stripe.test/session",
      paymentStatus: "pending",
    });
  });
});
