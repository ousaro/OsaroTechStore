import { describe, it } from "mocha";
import { expect } from "chai";
import {
  assertManagedUserCredentials,
  assertManagedUserProfilePatch,
  createValidatedAuthAccountAccess,
} from "../../../modules/users/ports/output/authAccountAccessPort.js";

describe("auth account access contract", () => {
  it("rejects profile updates outside the users profile boundary", () => {
    expect(() =>
      assertManagedUserProfilePatch({
        firstName: "Jane",
        password: "secret",
      })
    ).to.throw("managed user profile updates must not include password");
  });

  it("rejects incomplete credential payloads", () => {
    expect(() => assertManagedUserCredentials({ _id: "u1" })).to.throw(
      "managed user credentials.password is required"
    );
  });

  it("wraps auth collaboration methods with payload validation", async () => {
    const contract = createValidatedAuthAccountAccess({
      listManagedUserProfiles: async () => [
        { _id: "u1", email: "jane@example.com", admin: false },
      ],
      getManagedUserProfile: async () => ({
        _id: "u1",
        email: "jane@example.com",
        admin: false,
      }),
      updateManagedUserProfile: async () => ({
        _id: "u1",
        email: "jane@example.com",
        admin: false,
      }),
      removeManagedUserProfile: async () => ({
        _id: "u1",
        email: "jane@example.com",
        admin: false,
      }),
      getManagedUserCredentials: async () => ({ _id: "u1", password: "hashed" }),
      updateManagedUserCredentials: async () => ({
        _id: "u1",
        email: "jane@example.com",
        admin: false,
      }),
    });

    expect(await contract.listManagedUserProfiles()).to.deep.equal([
      { _id: "u1", email: "jane@example.com", admin: false },
    ]);
    expect(
      await contract.updateManagedUserCredentials("u1", { password: "new-hash" })
    ).to.deep.equal({
      _id: "u1",
      email: "jane@example.com",
      admin: false,
    });
  });
});
