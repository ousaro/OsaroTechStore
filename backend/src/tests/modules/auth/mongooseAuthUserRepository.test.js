import { describe, it, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createMongooseAuthUserRepository } from "../../../modules/auth/adapters/repositories/mongooseAuthUserRepository.js";
import UserModel from "../../../modules/auth/adapters/persistence/userModel.js";
import { AuthUnauthorizedError } from "../../../modules/auth/application/errors/AuthApplicationError.js";

describe("mongooseAuthUserRepository", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("throws an auth unauthorized error when the user cannot be found for token auth", async () => {
    sinon.stub(UserModel, "findOne").returns({
      select: sinon.stub().resolves(null),
    });
    const repository = createMongooseAuthUserRepository();

    try {
      await repository.findUserIdOnly("missing-user");
      expect.fail("Expected findUserIdOnly to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(AuthUnauthorizedError);
      expect(error.message).to.equal("Request is not authorized");
      expect(error.code).to.equal("AUTH_UNAUTHORIZED");
    }
  });
});
