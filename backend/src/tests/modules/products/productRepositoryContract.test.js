import { describe, it } from "mocha";
import { expect } from "chai";
import { createMongooseProductRepository } from "../../../modules/products/adapters/repositories/mongooseProductRepository.js";
import { assertProductRepositoryPort } from "../../../modules/products/ports/output/productRepositoryPort.js";

describe("product repository contract", () => {
  it("implements the expected product repository port", () => {
    const repository = createMongooseProductRepository();

    expect(() =>
      assertProductRepositoryPort(repository, [
        "isValidId",
        "findAll",
        "findById",
        "findRelated",
        "create",
        "findByIdAndUpdate",
        "findByIdAndDelete",
        "deleteByCategoryId",
        "updateNewStatus",
      ])
    ).to.not.throw();
  });
});
