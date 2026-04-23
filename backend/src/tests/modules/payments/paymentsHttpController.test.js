import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createPaymentsHttpController } from "../../../modules/payments/infrastructure/http/paymentsHttpController.js";

describe("payments http controller", () => {
  it("returns provider-neutral payment payloads", async () => {
    const paymentsCommandPort = {
      createPaymentIntent: sinon.stub().resolves({
        id: "cs_123",
        url: "https://checkout.test",
      }),
      verifyWebhook: sinon.stub().resolves({ received: true }),
    };
    const paymentsQueryPort = {
      getSessionDetails: sinon.stub().resolves({
        id: "cs_123",
        paymentReference: "pay_123",
        paymentStatus: "paid",
      }),
    };
    const { getSessionDetailsHandler } = createPaymentsHttpController({
      paymentsCommandPort,
      paymentsQueryPort,
    });
    const req = { params: { sessionId: "cs_123" } };
    const captured = {};
    const res = {
      status(code) {
        captured.statusCode = code;
        return this;
      },
      json(body) {
        captured.body = body;
        return this;
      },
    };

    await getSessionDetailsHandler(req, res, (error) => {
      if (error) {
        throw error;
      }
    });

    expect(captured.statusCode).to.equal(200);
    expect(captured.body).to.deep.equal({
      id: "cs_123",
      paymentReference: "pay_123",
      paymentStatus: "paid",
    });
    expect("providerTransactionId" in captured.body).to.equal(false);
  });
});
