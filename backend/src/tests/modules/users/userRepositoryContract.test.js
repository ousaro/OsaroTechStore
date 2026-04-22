import { describe, it } from "mocha";
import { expect } from "chai";
import { createMongooseUserRepository } from "../../../modules/users/infrastructure/repositories/mongooseUserRepository.js";
import { assertAuthAccountAccessPort } from "../../../modules/users/ports/output/authAccountAccessPort.js";
import { assertUserRepositoryPort } from "../../../modules/users/ports/output/userRepositoryPort.js";

describe("user repository contract", () => {
  it("implements the expected user repository port", () => {
    const repository = createMongooseUserRepository({
      authAccountAccess: {
        listManagedUserAccounts: async () => [],
        getManagedUserAccount: async () => null,
        updateManagedUserAccountProfile: async () => null,
        removeManagedUserAccount: async () => null,
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

  it("requires the auth account access port dependency", () => {
    expect(() => createMongooseUserRepository({ authAccountAccess: {} })).to.throw(
      "authAccountAccess port must implement listManagedUserAccounts"
    );

    expect(() =>
      assertAuthAccountAccessPort(
        {
          listManagedUserAccounts: async () => [],
          getManagedUserAccount: async () => null,
          updateManagedUserAccountProfile: async () => null,
          removeManagedUserAccount: async () => null,
        },
        [
          "listManagedUserAccounts",
          "getManagedUserAccount",
          "updateManagedUserAccountProfile",
          "removeManagedUserAccount",
        ]
      )
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
      authAccountAccess: {
        listManagedUserAccounts: async () => {
          calls.push(["listManagedUserAccounts"]);
          return [rawUser];
        },
        getManagedUserAccount: async (id) => {
          calls.push(["getManagedUserAccount", id]);
          return rawUser;
        },
        updateManagedUserAccountProfile: async (id, updates) => {
          calls.push(["updateManagedUserAccountProfile", id, updates]);
          return { ...rawUser, ...updates };
        },
        removeManagedUserAccount: async (id) => {
          calls.push(["removeManagedUserAccount", id]);
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
      ["listManagedUserAccounts"],
      ["getManagedUserAccount", "507f1f77bcf86cd799439011"],
      ["updateManagedUserAccountProfile", "507f1f77bcf86cd799439011", { firstName: "Jane" }],
      ["removeManagedUserAccount", "507f1f77bcf86cd799439011"],
    ]);
  });
});
