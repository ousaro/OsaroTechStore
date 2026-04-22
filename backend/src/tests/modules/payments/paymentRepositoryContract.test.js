import { describe, it } from "mocha";
import { expect } from "chai";
import { createMongoosePaymentRepository } from "../../../modules/payments/infrastructure/repositories/mongoosePaymentRepository.js";
import { assertPaymentRepositoryPort } from "../../../modules/payments/ports/output/paymentRepositoryPort.js";

describe("payment repository contract", () => {
  it("implements the expected payment repository port", () => {
    const repository = createMongoosePaymentRepository();

    expect(() =>
      assertPaymentRepositoryPort(repository, [
        "savePaymentSession",
        "findPaymentSessionById",
        "updatePaymentSessionStatus",
        "applyWebhookStateChangeOnce",
      ])
    ).to.not.throw();
  });
});
