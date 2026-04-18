import { describe, it } from "mocha";
import { expect } from "chai";
import { toProductRecord } from "../../../modules/products/infrastructure/repositories/productRecordMapper.js";

describe("product record mapper", () => {
  it("maps a raw product into a stable repository record shape", () => {
    const rawProduct = {
      _id: "507f1f77bcf86cd799439013",
      ownerId: "user-1",
      name: "Phone",
      description: "A flagship phone",
      price: 900,
      raw_price: 1000,
      discount: 10,
      image: "main.jpg",
      otherImages: ["a.jpg", "b.jpg"],
      categoryId: "cat-1",
      category: "Phones",
      countInStock: 5,
      moreInformations: "More info",
      reviews: [{ userId: "user-2", rating: 5 }],
      rating: "4.5",
      isNewProduct: true,
      salesCount: 12,
      lastSold: new Date("2026-04-01T00:00:00.000Z"),
      createdAt: "ignore-me",
      updatedAt: "ignore-me-too",
      save: () => {},
    };

    expect(toProductRecord(rawProduct)).to.deep.equal({
      _id: "507f1f77bcf86cd799439013",
      ownerId: "user-1",
      name: "Phone",
      description: "A flagship phone",
      price: 900,
      raw_price: 1000,
      discount: 10,
      image: "main.jpg",
      otherImages: ["a.jpg", "b.jpg"],
      categoryId: "cat-1",
      category: "Phones",
      countInStock: 5,
      moreInformations: "More info",
      reviews: [{ userId: "user-2", rating: 5 }],
      rating: "4.5",
      isNewProduct: true,
      salesCount: 12,
      lastSold: new Date("2026-04-01T00:00:00.000Z"),
    });
  });

  it("returns null when no raw product is provided", () => {
    expect(toProductRecord(null)).to.equal(null);
  });
});
