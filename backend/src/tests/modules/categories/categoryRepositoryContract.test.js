import { describe, it } from "mocha";
import { expect } from "chai";
import { createMongooseCategoryRepository } from "../../../modules/categories/adapters/repositories/mongooseCategoryRepository.js";
import { assertCategoryRepositoryPort } from "../../../modules/categories/ports/output/categoryRepositoryPort.js";

describe("category repository contract", () => {
  it("implements the expected category repository port", () => {
    const repository = createMongooseCategoryRepository();

    expect(() =>
      assertCategoryRepositoryPort(repository, [
        "findAllSorted",
        "create",
        "findByIdAndDelete",
      ])
    ).to.not.throw();
  });
});
