import { describe, it } from "mocha";
import { expect } from "chai";
import { createProduct, createProductUpdatePatch } from "../../../../src/modules/products/domain/entities/Product.js";

describe("Product Domain", () => {
  it("creates a valid product aggregate", () => {
    const product = createProduct({
      ownerId: "u1",
      payload: {
        name: "Phone",
        description: "desc",
        raw_price: 1000,
        discount: 10,
        image: "img",
        otherImages: ["a", "b"],
        categoryId: "c1",
        category: "Phones",
        countInStock: 3,
        moreInformations: "info",
      },
    });

    const data = product.toPrimitives();
    expect(data.ownerId).to.equal("u1");
    expect(data.price).to.equal(900);
  });

  it("throws when required fields are missing", () => {
    expect(() =>
      createProduct({
        ownerId: "u1",
        payload: { name: "", raw_price: 10 },
      })
    ).to.throw("Please fill in all the fields");
  });

  it("throws when negative numeric values are provided", () => {
    expect(() =>
      createProduct({
        ownerId: "u1",
        payload: {
          name: "X",
          description: "Y",
          raw_price: -1,
          discount: 10,
          image: "img",
          otherImages: ["a"],
          categoryId: "c1",
          category: "Phones",
          countInStock: 1,
          moreInformations: "info",
        },
      })
    ).to.throw("Price and countInStock cannot be negative");
  });
});
