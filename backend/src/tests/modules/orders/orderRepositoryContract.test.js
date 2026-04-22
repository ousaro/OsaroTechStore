import { describe, it } from "mocha";
import { expect } from "chai";
import { createMongooseOrderRepository } from "../../../modules/orders/infrastructure/repositories/mongooseOrderRepository.js";
import { assertOrderRepositoryPort } from "../../../modules/orders/ports/output/orderRepositoryPort.js";

describe("order repository contract", () => {
  it("implements the expected order repository port", () => {
    const repository = createMongooseOrderRepository();

    expect(() =>
      assertOrderRepositoryPort(repository, [
        "isValidId",
        "findAllSorted",
        "findById",
        "findByPaymentReference",
        "findByTransactionId",
        "create",
        "findByIdAndUpdate",
        "findByIdAndDelete",
      ])
    ).to.not.throw();
  });
});
