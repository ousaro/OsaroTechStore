import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildLinkPaymentToOrderUseCase } from "../../../modules/payments/application/commands/linkPaymentToOrderUseCase.js";

describe("linkPaymentToOrderUseCase", () => {
  it("attaches an order id to a persisted payment by payment reference", async () => {
    const paymentRepository = {
      linkPaymentToOrder: sinon.stub().resolves({
        id: "cs_test_123",
        paymentReference: "pay_123",
        orderId: "o1",
        paymentStatus: "pending",
      }),
    };
    const useCase = buildLinkPaymentToOrderUseCase({ paymentRepository });

    const result = await useCase({
      paymentReference: "pay_123",
      orderId: "o1",
    });

    expect(paymentRepository.linkPaymentToOrder.calledOnceWithExactly({
      paymentReference: "pay_123",
      orderId: "o1",
    })).to.equal(true);
    expect(result).to.deep.equal({
      id: "cs_test_123",
      paymentReference: "pay_123",
      orderId: "o1",
      paymentStatus: "pending",
    });
  });
});
