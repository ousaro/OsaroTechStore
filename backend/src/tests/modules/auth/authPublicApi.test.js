import { describe, it } from "mocha";
import { expect } from "chai";
import * as authPublicApi from "../../../modules/auth/public-api.js";

describe("auth public api", () => {
  it("exposes only the auth capabilities used across module boundaries", () => {
    expect(Object.keys(authPublicApi).sort()).to.deep.equal([
      "deleteUserAccountById",
      "getUserAccountById",
      "listNonAdminUserAccounts",
      "updateUserAccountById",
      "verifyAccessToken",
    ]);
  });

  it("exposes account capabilities as named functions instead of a broad object", () => {
    expect(authPublicApi.listNonAdminUserAccounts).to.be.a("function");
    expect(authPublicApi.getUserAccountById).to.be.a("function");
    expect(authPublicApi.updateUserAccountById).to.be.a("function");
    expect(authPublicApi.deleteUserAccountById).to.be.a("function");
  });

  it("exposes access-token verification as a callable capability", () => {
    expect(authPublicApi.verifyAccessToken).to.be.a("function");
  });
});
