import { describe, it } from "mocha";
import { expect } from "chai";
import * as authPublicApi from "../../../modules/auth/public-api.js";

describe("auth public api", () => {
  it("exposes only the auth capabilities used across module boundaries", () => {
    expect(Object.keys(authPublicApi).sort()).to.deep.equal([
      "deleteAccountById",
      "getAccountById",
      "listNonAdminAccounts",
      "updateAccountById",
      "verifyAccessToken",
    ]);
  });

  it("exposes account capabilities as named functions instead of a broad object", () => {
    expect(authPublicApi.listNonAdminAccounts).to.be.a("function");
    expect(authPublicApi.getAccountById).to.be.a("function");
    expect(authPublicApi.updateAccountById).to.be.a("function");
    expect(authPublicApi.deleteAccountById).to.be.a("function");
  });

  it("exposes access-token verification as a callable capability", () => {
    expect(authPublicApi.verifyAccessToken).to.be.a("function");
  });
});
