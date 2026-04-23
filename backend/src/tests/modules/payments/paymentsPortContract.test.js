import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createPaymentsCommandPort } from "../../../../src/modules/payments/ports/input/paymentsCommandPort.js";
import { createPaymentsQueryPort } from "../../../../src/modules/payments/ports/input/paymentsQueryPort.js";
import { createPaymentsHttpController } from "../../../../src/modules/payments/adapters/http/paymentsHttpController.js";

const flushAsyncHandler = () => new Promise((resolve) => setImmediate(resolve));

describe("payments ports contract", () => {
  it("builds a command port with payment-changing handlers only", () => {
    const commandPort = createPaymentsCommandPort({
      createPaymentIntent: () => {},
      verifyWebhook: () => {},
    });

    expect(commandPort).to.have.keys(["createPaymentIntent", "verifyWebhook"]);
  });

  it("requires the query port to implement getSessionDetails", () => {
    expect(() => createPaymentsQueryPort({})).to.throw(
      "paymentsQueryPort must implement getSessionDetails"
    );
  });

  it("routes create and webhook calls through the command port and reads through the query port", async () => {
    const paymentsCommandPort = createPaymentsCommandPort({
      createPaymentIntent: sinon.stub().resolves({ url: "https://stripe.test/session" }),
      verifyWebhook: sinon.stub().resolves({ received: true }),
    });
    const paymentsQueryPort = createPaymentsQueryPort({
      getSessionDetails: sinon.stub().resolves({ id: "cs_test_123", paymentStatus: "paid" }),
    });

    const {
      createPaymentIntentHandler,
      stripeWebhookHandler,
      getSessionDetailsHandler,
    } = createPaymentsHttpController({
      paymentsCommandPort,
      paymentsQueryPort,
    });

    const postRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const webhookRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const getRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const next = sinon.spy();

    createPaymentIntentHandler({ body: { items: [{ name: "Phone", price: 100, quantity: 1 }] } }, postRes, next);
    stripeWebhookHandler(
      {
        body: Buffer.from("{}"),
        headers: { "stripe-signature": "sig_test" },
      },
      webhookRes,
      next
    );
    getSessionDetailsHandler(
      { params: { sessionId: "cs_test_123" } },
      getRes,
      next
    );
    await flushAsyncHandler();

    expect(paymentsCommandPort.createPaymentIntent.calledOnce).to.equal(true);
    expect(paymentsCommandPort.verifyWebhook.calledOnce).to.equal(true);
    expect(paymentsQueryPort.getSessionDetails.calledOnceWithExactly({ sessionId: "cs_test_123" })).to.equal(true);
    expect(postRes.status.calledWith(200)).to.equal(true);
    expect(webhookRes.status.calledWith(200)).to.equal(true);
    expect(getRes.status.calledWith(200)).to.equal(true);
    expect(next.called).to.equal(false);
  });
});
