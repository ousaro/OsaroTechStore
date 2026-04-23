import { describe, it } from "mocha";
import { expect } from "chai";
import { toCategoryRecord } from "../../../modules/categories/adapters/repositories/categoryRecordMapper.js";

describe("category record mapper", () => {
  it("maps a raw category into a stable repository record shape", () => {
    const rawCategory = {
      _id: "cat-1",
      name: "Phones",
      description: "Smartphones and accessories",
      image: "phones.png",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      __v: 0,
    };

    expect(toCategoryRecord(rawCategory)).to.deep.equal({
      _id: "cat-1",
      name: "Phones",
      description: "Smartphones and accessories",
      image: "phones.png",
    });
  });

  it("returns null when no raw category is provided", () => {
    expect(toCategoryRecord(null)).to.equal(null);
  });
});
