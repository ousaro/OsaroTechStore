import { describe, it } from "mocha";
import { expect } from "chai";
import { createCategory } from "../../../../src/modules/categories/domain/entities/Category.js";
import { DomainValidationError } from "../../../../src/shared/domain/errors/DomainValidationError.js";

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
    try {
      createCategory({
        name: "",
        description: "desc",
        image: "",
      });
      expect.fail("Expected createCategory to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(DomainValidationError);
      expect(error.message).to.equal("Please fill in all the fields");
      expect(error.meta).to.deep.equal({
        emptyFields: ["name", "image"],
      });
    }
  });
});
