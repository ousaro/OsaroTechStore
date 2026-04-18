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

  it("accepts zero discount and zero stock as valid values", () => {
    const product = createProduct({
      ownerId: "u1",
      payload: {
        name: "Phone",
        description: "desc",
        raw_price: 1000,
        discount: 0,
        image: "img",
        otherImages: ["a", "b"],
        categoryId: "c1",
        category: "Phones",
        countInStock: 0,
        moreInformations: "info",
      },
    });

    const data = product.toPrimitives();
    expect(data.discount).to.equal(0);
    expect(data.countInStock).to.equal(0);
    expect(data.price).to.equal(1000);
  });

  it("recalculates price when only raw price changes", () => {
    const patch = createProductUpdatePatch(
      { raw_price: 1200 },
      { raw_price: 1000, discount: 10 }
    );

    expect(patch.toPrimitives()).to.deep.equal({
      raw_price: 1200,
      price: 1080,
    });
  });

  it("recalculates price when only discount changes", () => {
    const patch = createProductUpdatePatch(
      { discount: 25 },
      { raw_price: 1000, discount: 10 }
    );

    expect(patch.toPrimitives()).to.deep.equal({
      discount: 25,
      price: 750,
    });
  });
});
