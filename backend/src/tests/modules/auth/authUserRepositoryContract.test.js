import { describe, it } from "mocha";
import { expect } from "chai";
import { createMongooseAuthUserRepository } from "../../../modules/auth/adapters/repositories/mongooseAuthUserRepository.js";
import { assertAuthUserRepositoryPort } from "../../../modules/auth/ports/output/authUserRepositoryPort.js";

describe("auth user repository contract", () => {
  it("implements the expected auth user repository port", () => {
    const repository = createMongooseAuthUserRepository();

    expect(() =>
      assertAuthUserRepositoryPort(repository, [
        "findManagedAccountsSorted",
        "findByEmail",
        "findById",
        "create",
        "findByIdAndUpdate",
        "findByIdAndDelete",
        "hashPassword",
        "comparePassword",
        "findUserIdOnly",
      ])
    ).to.not.throw();
  });
});
