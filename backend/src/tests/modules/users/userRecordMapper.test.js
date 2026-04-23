import { describe, it } from "mocha";
import { expect } from "chai";
import { toUserRecord } from "../../../modules/users/adapters/output/repositories/userRecordMapper.js";

describe("user record mapper", () => {
  it("maps a raw user into a stable repository record shape", () => {
    const rawUser = {
      _id: "507f1f77bcf86cd799439011",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      admin: false,
      picture: "profile.jpg",
      phone: "+123456789",
      address: "123 Main St",
      city: "Casablanca",
      country: "Morocco",
      state: "CA",
      postalCode: 20000,
      favorites: ["prod-1"],
      cart: [{ productId: "prod-2", quantity: 1 }],
      createdAt: "ignore-me",
      updatedAt: "ignore-me-too",
      save: () => {},
    };

    expect(toUserRecord(rawUser)).to.deep.equal({
      _id: "507f1f77bcf86cd799439011",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      admin: false,
      picture: "profile.jpg",
      phone: "+123456789",
      address: "123 Main St",
      city: "Casablanca",
      country: "Morocco",
      state: "CA",
      postalCode: 20000,
      favorites: ["prod-1"],
      cart: [{ productId: "prod-2", quantity: 1 }],
    });
  });

  it("returns null when no raw user is provided", () => {
    expect(toUserRecord(null)).to.equal(null);
  });
});
