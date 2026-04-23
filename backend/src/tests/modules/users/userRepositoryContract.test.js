import { describe, it } from "mocha";
import { expect } from "chai";
import { createMongooseUserRepository } from "../../../modules/users/adapters/repositories/mongooseUserRepository.js";
import { assertAuthAccountAccessPort } from "../../../modules/users/ports/output/authAccountAccessPort.js";
import { assertUserRepositoryPort } from "../../../modules/users/ports/output/userRepositoryPort.js";

describe("user repository contract", () => {
  it("implements the expected user repository port", () => {
    const repository = createMongooseUserRepository({
      authUserManagement: {
        listManagedUserProfiles: async () => [],
        getManagedUserProfile: async () => null,
        updateManagedUserProfile: async () => null,
        removeManagedUserProfile: async () => null,
        getManagedUserCredentials: async () => null,
        updateManagedUserCredentials: async () => null,
      },
    });

    expect(() =>
      assertUserRepositoryPort(repository, [
        "isValidId",
        "findAllNonAdminSorted",
        "findById",
        "findByIdAndUpdate",
        "findByIdAndDelete",
        "getCredentialsById",
        "updateCredentialsById",
        "comparePassword",
        "hashPassword",
      ])
    ).to.not.throw();
  });

  it("requires the auth account access port dependency", () => {
    expect(() => createMongooseUserRepository({ authUserManagement: {} })).to.throw(
      "authAccountAccess port must implement listManagedUserProfiles"
    );

    expect(() =>
      assertAuthAccountAccessPort(
        {
          listManagedUserProfiles: async () => [],
          getManagedUserProfile: async () => null,
          updateManagedUserProfile: async () => null,
          removeManagedUserProfile: async () => null,
          getManagedUserCredentials: async () => null,
          updateManagedUserCredentials: async () => null,
        },
        [
          "listManagedUserProfiles",
          "getManagedUserProfile",
          "updateManagedUserProfile",
          "removeManagedUserProfile",
          "getManagedUserCredentials",
          "updateManagedUserCredentials",
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
      authUserManagement: {
        listManagedUserProfiles: async () => {
          calls.push(["listManagedUserProfiles"]);
          return [rawUser];
        },
        getManagedUserProfile: async (id) => {
          calls.push(["getManagedUserProfile", id]);
          return rawUser;
        },
        updateManagedUserProfile: async (id, updates) => {
          calls.push(["updateManagedUserProfile", id, updates]);
          return { ...rawUser, ...updates };
        },
        removeManagedUserProfile: async (id) => {
          calls.push(["removeManagedUserProfile", id]);
          return rawUser;
        },
        getManagedUserCredentials: async (id) => {
          calls.push(["getManagedUserCredentials", id]);
          return { _id: id, password: "hashed-password" };
        },
        updateManagedUserCredentials: async (id, updates) => {
          calls.push(["updateManagedUserCredentials", id, updates]);
          return { ...rawUser };
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
    const credentials = await repository.getCredentialsById(rawUser._id);
    const credentialUpdateResult = await repository.updateCredentialsById(rawUser._id, {
      password: "new-hash",
    });

    expect(listResult).to.deep.equal([expectedUserRecord]);
    expect(getResult).to.deep.equal(expectedUserRecord);
    expect(updateResult).to.deep.equal({ ...expectedUserRecord, firstName: "Jane" });
    expect(deleteResult).to.deep.equal(expectedUserRecord);
    expect(credentials).to.deep.equal({
      _id: "507f1f77bcf86cd799439011",
      password: "hashed-password",
    });
    expect(credentialUpdateResult).to.deep.equal(expectedUserRecord);
    expect(calls).to.deep.equal([
      ["listManagedUserProfiles"],
      ["getManagedUserProfile", "507f1f77bcf86cd799439011"],
      ["updateManagedUserProfile", "507f1f77bcf86cd799439011", { firstName: "Jane" }],
      ["removeManagedUserProfile", "507f1f77bcf86cd799439011"],
      ["getManagedUserCredentials", "507f1f77bcf86cd799439011"],
      ["updateManagedUserCredentials", "507f1f77bcf86cd799439011", { password: "new-hash" }],
    ]);
  });
});
