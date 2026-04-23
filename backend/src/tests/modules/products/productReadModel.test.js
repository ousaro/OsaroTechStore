import { describe, it } from "mocha";
import { expect } from "chai";
import { toProductReadModel } from "../../../modules/products/application/read-models/productReadModel.js";

describe("product read model", () => {
  it("keeps an explicit client-facing product shape", () => {
    expect(
      toProductReadModel({
        _id: "p1",
        name: "Phone",
        description: "Flagship",
        image: "phone.png",
        brand: "Osaro",
        category: "Phones",
        price: 999,
        countInStock: 3,
        rating: 4.5,
        numReviews: 10,
        isNewProduct: true,
      })
    ).to.deep.equal({
      _id: "p1",
      name: "Phone",
      description: "Flagship",
      image: "phone.png",
      brand: "Osaro",
      category: "Phones",
      price: 999,
      countInStock: 3,
      rating: 4.5,
      numReviews: 10,
      isNewProduct: true,
    });
  });
});
