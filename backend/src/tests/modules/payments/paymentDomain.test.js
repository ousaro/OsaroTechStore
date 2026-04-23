import { describe, it } from "mocha";
import { expect } from "chai";
import { DomainValidationError } from "../../../../src/shared/domain/errors/DomainValidationError.js";
import {
  createCheckoutItem,
  createCheckoutItems,
} from "../../../../src/modules/payments/domain/value-objects/CheckoutItem.js";
import { createPaymentWorkflow } from "../../../../src/modules/payments/domain/entities/PaymentWorkflow.js";
import { createRedirectPaymentWorkflow } from "../../../../src/modules/payments/domain/services/paymentWorkflowService.js";

describe("Payment Domain", () => {
  it("creates checkout items and a payment workflow with stable primitives", () => {
    const item = createCheckoutItem({
      name: "Phone",
      price: 100,
      quantity: 2,
    });
    const payment = createPaymentWorkflow({
      id: "cs_test_123",
      paymentReference: "pay_123",
      providerPaymentId: "pi_123",
      url: "https://stripe.test/session",
      provider: "stripe",
      workflowType: "redirect_session",
      providerStatus: "paid",
      paymentStatus: "paid",
    });

    expect(item.toPrimitives()).to.deep.equal({
      name: "Phone",
      price: 100,
      quantity: 2,
    });
    expect(payment.toPrimitives()).to.deep.equal({
      id: "cs_test_123",
      paymentReference: "pay_123",
      provider: "stripe",
      workflowType: "redirect_session",
      providerPaymentId: "pi_123",
      url: "https://stripe.test/session",
      providerStatus: "paid",
      paymentStatus: "paid",
    });
  });

  it("throws when checkout items are invalid", () => {
    expect(() => createCheckoutItems([{ name: "", price: -1, quantity: 0 }])).to.throw(
      DomainValidationError,
      "Invalid item at index 0: item.name is required"
    );
  });

  it("models redirect payment creation as a payment workflow", () => {
    const payment = createRedirectPaymentWorkflow({
      gatewayPayment: {
        id: "cs_test_123",
        provider: "stripe",
        workflowType: "redirect_session",
        url: "https://stripe.test/session",
      },
    });

    expect(payment.toPrimitives()).to.deep.equal({
      id: "cs_test_123",
      provider: "stripe",
      workflowType: "redirect_session",
      url: "https://stripe.test/session",
      paymentStatus: "pending",
    });
  });
});
