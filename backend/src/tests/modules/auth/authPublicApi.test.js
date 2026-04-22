import { describe, it } from "mocha";
import { expect } from "chai";
import * as authPublicApi from "../../../modules/auth/public-api.js";

describe("auth public api", () => {
  it("exposes only the auth capabilities used across module boundaries", () => {
    expect(Object.keys(authPublicApi).sort()).to.deep.equal([
      "getManagedUserAccount",
      "listManagedUserAccounts",
      "removeManagedUserAccount",
      "updateManagedUserAccountProfile",
      "verifyAccessToken",
    ]);
  });

  it("exposes account-management capabilities as named functions instead of repository verbs", () => {
    expect(authPublicApi.listManagedUserAccounts).to.be.a("function");
    expect(authPublicApi.getManagedUserAccount).to.be.a("function");
    expect(authPublicApi.updateManagedUserAccountProfile).to.be.a("function");
    expect(authPublicApi.removeManagedUserAccount).to.be.a("function");
  });

  it("exposes access-token verification as a callable capability", () => {
    expect(authPublicApi.verifyAccessToken).to.be.a("function");
  });
});
