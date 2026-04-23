import { describe, it } from "mocha";
import { expect } from "chai";
import { toPaymentReadModel } from "../../../modules/payments/application/read-models/paymentReadModel.js";

describe("payment read model", () => {
  it("exposes provider-neutral payment transport fields only", () => {
    expect(
      toPaymentReadModel({
        id: "cs_123",
        paymentReference: "pay_123",
        orderId: "o1",
        url: "https://checkout.test",
        paymentStatus: "paid",
        providerTransactionId: "pi_123",
        lastWebhookEventId: "evt_123",
      })
    ).to.deep.equal({
      id: "cs_123",
      paymentReference: "pay_123",
      orderId: "o1",
      url: "https://checkout.test",
      paymentStatus: "paid",
    });
  });
});
