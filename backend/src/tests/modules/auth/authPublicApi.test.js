import { describe, it } from "mocha";
import { expect } from "chai";
import * as authPublicApi from "../../../modules/auth/public-api.js";

describe("auth public api", () => {
  it("exposes only the auth capabilities used across module boundaries", () => {
    expect(Object.keys(authPublicApi).sort()).to.deep.equal([
      "getManagedUserCredentials",
      "getManagedUserProfile",
      "listManagedUserProfiles",
      "removeManagedUserProfile",
      "updateManagedUserCredentials",
      "updateManagedUserProfile",
      "verifyAccessToken",
    ]);
  });

  it("exposes separate profile and credential collaboration capabilities", () => {
    expect(authPublicApi.listManagedUserProfiles).to.be.a("function");
    expect(authPublicApi.getManagedUserProfile).to.be.a("function");
    expect(authPublicApi.updateManagedUserProfile).to.be.a("function");
    expect(authPublicApi.removeManagedUserProfile).to.be.a("function");
    expect(authPublicApi.getManagedUserCredentials).to.be.a("function");
    expect(authPublicApi.updateManagedUserCredentials).to.be.a("function");
  });

  it("exposes access-token verification as a callable capability", () => {
    expect(authPublicApi.verifyAccessToken).to.be.a("function");
  });
});
