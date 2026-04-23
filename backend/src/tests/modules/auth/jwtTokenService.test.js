import { describe, it, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import { createJwtTokenService } from "../../../modules/auth/adapters/output/services/jwtTokenService.js";
import { AuthUnauthorizedError } from "../../../modules/auth/application/errors/AuthApplicationError.js";

describe("jwtTokenService", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("throws an auth unauthorized error when the authorization header is malformed", () => {
    const tokenService = createJwtTokenService();

    expect(() => tokenService.verifyAndExtractUserId("bad-token")).to.throw(
      AuthUnauthorizedError,
      "Request is not authorized"
    );
  });

  it("throws an auth unauthorized error when JWT verification fails", () => {
    sinon.stub(jwt, "verify").throws(new Error("invalid token"));
    const tokenService = createJwtTokenService();

    expect(() => tokenService.verifyAndExtractUserId("Bearer invalid-token")).to.throw(
      AuthUnauthorizedError,
      "Request is not authorized"
    );
  });
});
