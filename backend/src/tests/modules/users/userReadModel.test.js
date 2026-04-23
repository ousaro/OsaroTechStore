import { describe, it } from "mocha";
import { expect } from "chai";
import { toUserReadModel } from "../../../modules/users/application/read-models/userReadModel.js";

describe("user read model", () => {
  it("removes credential fields from user-facing payloads", () => {
    expect(
      toUserReadModel({
        _id: "u1",
        firstName: "Jane",
        email: "jane@example.com",
        password: "hashed",
        admin: false,
      })
    ).to.deep.equal({
      _id: "u1",
      firstName: "Jane",
      email: "jane@example.com",
      admin: false,
    });
  });
});
