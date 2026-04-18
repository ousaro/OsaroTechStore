import { describe, it } from "mocha";
import { expect } from "chai";
import { createMongooseUserRepository } from "../../../modules/users/infrastructure/repositories/mongooseUserRepository.js";
import { assertUserRepositoryPort } from "../../../modules/users/ports/output/userRepositoryPort.js";

describe("user repository contract", () => {
  it("implements the expected user repository port", () => {
    const repository = createMongooseUserRepository({
      userAccounts: {
        listNonAdminAccounts: async () => [],
        getAccountById: async () => null,
        updateAccountById: async () => null,
        deleteAccountById: async () => null,
      },
    });

    expect(() =>
      assertUserRepositoryPort(repository, [
        "isValidId",
        "findAllNonAdminSorted",
        "findById",
        "findByIdAndUpdate",
        "findByIdAndDelete",
        "comparePassword",
        "hashPassword",
      ])
    ).to.not.throw();
  });

  it("delegates account operations through the narrowed auth contract", async () => {
    const calls = [];
    const userRecord = { _id: "507f1f77bcf86cd799439011", email: "john@example.com" };
    const repository = createMongooseUserRepository({
      userAccounts: {
        listNonAdminAccounts: async () => {
          calls.push(["listNonAdminAccounts"]);
          return [userRecord];
        },
        getAccountById: async (id) => {
          calls.push(["getAccountById", id]);
          return userRecord;
        },
        updateAccountById: async (id, updates) => {
          calls.push(["updateAccountById", id, updates]);
          return { ...userRecord, ...updates };
        },
        deleteAccountById: async (id) => {
          calls.push(["deleteAccountById", id]);
          return userRecord;
        },
      },
    });

    const patch = {
      toPrimitives() {
        return { firstName: "Jane" };
      },
    };

    const listResult = await repository.findAllNonAdminSorted();
    const getResult = await repository.findById(userRecord._id);
    const updateResult = await repository.findByIdAndUpdate(userRecord._id, patch);
    const deleteResult = await repository.findByIdAndDelete(userRecord._id);

    expect(listResult).to.deep.equal([userRecord]);
    expect(getResult).to.equal(userRecord);
    expect(updateResult).to.deep.equal({ ...userRecord, firstName: "Jane" });
    expect(deleteResult).to.equal(userRecord);
    expect(calls).to.deep.equal([
      ["listNonAdminAccounts"],
      ["getAccountById", "507f1f77bcf86cd799439011"],
      ["updateAccountById", "507f1f77bcf86cd799439011", { firstName: "Jane" }],
      ["deleteAccountById", "507f1f77bcf86cd799439011"],
    ]);
  });
});
