import { describe, it } from "mocha";
import { expect } from "chai";
import {
  assertPaymentRepositoryCommandPort,
  assertPaymentRepositoryQueryPort,
} from "../../../modules/payments/ports/output/paymentRepositoryPort.js";

describe("payment repository port helpers", () => {
  it("accepts read-side payment repository methods", () => {
    expect(() =>
      assertPaymentRepositoryQueryPort(
        {
          findPaymentWorkflowById: async () => null,
        },
        ["findPaymentWorkflowById"]
      )
    ).to.not.throw();
  });

  it("rejects query methods in the command-side assertion", () => {
    expect(() =>
      assertPaymentRepositoryCommandPort(
        {
          findPaymentWorkflowById: async () => null,
        },
        ["findPaymentWorkflowById"]
      )
    ).to.throw("paymentRepository command port must not require findPaymentWorkflowById");
  });
});
