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
    const rawUser = {
      _id: "507f1f77bcf86cd799439011",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashed-password",
      admin: false,
      picture: "profile.jpg",
      phone: "+123456789",
      address: "123 Main St",
      city: "Casablanca",
      country: "Morocco",
      state: "CA",
      postalCode: 20000,
      favorites: ["prod-1"],
      cart: [{ productId: "prod-2", quantity: 1 }],
    };
    const expectedUserRecord = { ...rawUser };
    const repository = createMongooseUserRepository({
      userAccounts: {
        listNonAdminAccounts: async () => {
          calls.push(["listNonAdminAccounts"]);
          return [rawUser];
        },
        getAccountById: async (id) => {
          calls.push(["getAccountById", id]);
          return rawUser;
        },
        updateAccountById: async (id, updates) => {
          calls.push(["updateAccountById", id, updates]);
          return { ...rawUser, ...updates };
        },
        deleteAccountById: async (id) => {
          calls.push(["deleteAccountById", id]);
          return rawUser;
        },
      },
    });

    const patch = {
      toPrimitives() {
        return { firstName: "Jane" };
      },
    };

    const listResult = await repository.findAllNonAdminSorted();
    const getResult = await repository.findById(rawUser._id);
    const updateResult = await repository.findByIdAndUpdate(rawUser._id, patch);
    const deleteResult = await repository.findByIdAndDelete(rawUser._id);

    expect(listResult).to.deep.equal([expectedUserRecord]);
    expect(getResult).to.deep.equal(expectedUserRecord);
    expect(updateResult).to.deep.equal({ ...expectedUserRecord, firstName: "Jane" });
    expect(deleteResult).to.deep.equal(expectedUserRecord);
    expect(calls).to.deep.equal([
      ["listNonAdminAccounts"],
      ["getAccountById", "507f1f77bcf86cd799439011"],
      ["updateAccountById", "507f1f77bcf86cd799439011", { firstName: "Jane" }],
      ["deleteAccountById", "507f1f77bcf86cd799439011"],
    ]);
  });
});
