import { describe, it } from "mocha";
import { expect } from "chai";
import * as authPublicApi from "../../../modules/auth/public-api.js";

describe("auth public api", () => {
  it("exposes only the auth capabilities used across module boundaries", () => {
    expect(Object.keys(authPublicApi).sort()).to.deep.equal([
      "userAccounts",
      "verifyAccessToken",
    ]);
  });

  it("exposes a narrowed user account contract", () => {
    expect(authPublicApi.userAccounts).to.be.an("object");
    expect(authPublicApi.userAccounts.listNonAdminAccounts).to.be.a("function");
    expect(authPublicApi.userAccounts.getAccountById).to.be.a("function");
    expect(authPublicApi.userAccounts.updateAccountById).to.be.a("function");
    expect(authPublicApi.userAccounts.deleteAccountById).to.be.a("function");
  });

  it("exposes access-token verification as a callable capability", () => {
    expect(authPublicApi.verifyAccessToken).to.be.a("function");
  });
});
