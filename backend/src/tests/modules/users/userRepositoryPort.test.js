import { describe, it } from "mocha";
import { expect } from "chai";
import {
  assertUserRepositoryCommandPort,
  assertUserRepositoryQueryPort,
} from "../../../modules/users/ports/output/userRepositoryPort.js";

describe("user repository port helpers", () => {
  it("accepts read-side user repository methods", () => {
    expect(() =>
      assertUserRepositoryQueryPort(
        {
          findById: async () => null,
        },
        ["findById"]
      )
    ).to.not.throw();
  });

  it("rejects read methods in the command-side assertion", () => {
    expect(() =>
      assertUserRepositoryCommandPort(
        {
          findById: async () => null,
        },
        ["findById"]
      )
    ).to.throw("userRepository command port must not require findById");
  });
});
