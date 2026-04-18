import { describe, it } from "mocha";
import { expect } from "chai";
import { createCategory } from "../../../../src/modules/categories/domain/entities/Category.js";

describe("Category Domain", () => {
  it("creates a valid category aggregate", () => {
    const category = createCategory({
      name: "Phones",
      description: "Smartphones and accessories",
      image: "https://img.example/phones.png",
    });

    const data = category.toPrimitives();
    expect(data.name).to.equal("Phones");
    expect(data.description).to.include("Smartphones");
  });

  it("throws when required fields are missing", () => {
    expect(() =>
      createCategory({
        name: "",
        description: "desc",
        image: "",
      })
    ).to.throw("Please fill in all the fields");
  });
});
