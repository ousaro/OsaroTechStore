import { describe, it } from "mocha";
import { expect } from "chai";
import { toCategoryReadModel } from "../../../modules/categories/application/read-models/categoryReadModel.js";

describe("category read model", () => {
  it("includes description so the category boundary stays consistent", () => {
    expect(
      toCategoryReadModel({
        _id: "c1",
        name: "Phones",
        description: "Smartphones and accessories",
        image: "phones.png",
      })
    ).to.deep.equal({
      _id: "c1",
      name: "Phones",
      description: "Smartphones and accessories",
      image: "phones.png",
    });
  });
});
