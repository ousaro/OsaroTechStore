import { describe, it } from "mocha";
import { expect } from "chai";
import * as productsPublicApi from "../../../modules/products/public-api.js";

describe("products public api", () => {
  it("exposes only the cross-module category cleanup capability", () => {
    expect(Object.keys(productsPublicApi).sort()).to.deep.equal([
      "removeProductsByCategory",
    ]);
  });

  it("exposes removeProductsByCategory as a callable capability", () => {
    expect(productsPublicApi.removeProductsByCategory).to.be.a("function");
  });
});
