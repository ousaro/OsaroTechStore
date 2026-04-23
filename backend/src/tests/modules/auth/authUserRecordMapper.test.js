import { describe, it } from "mocha";
import { expect } from "chai";
import { toAuthUserRecord } from "../../../modules/auth/adapters/output/repositories/authUserRecordMapper.js";

describe("auth user record mapper", () => {
  it("maps a raw auth user into a stable repository record shape", () => {
    const rawUser = {
      _id: "u1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashed",
      picture: "profile.png",
      admin: false,
      favorites: ["p1"],
      cart: [{ productId: "p2", quantity: 1 }],
      address: "123 Main St",
      city: "Casablanca",
      phone: "+123",
      country: "Morocco",
      postalCode: 20000,
      state: "CA",
      __v: 0,
    };

    expect(toAuthUserRecord(rawUser)).to.deep.equal({
      _id: "u1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashed",
      picture: "profile.png",
      admin: false,
      favorites: ["p1"],
      cart: [{ productId: "p2", quantity: 1 }],
      address: "123 Main St",
      city: "Casablanca",
      phone: "+123",
      country: "Morocco",
      postalCode: 20000,
      state: "CA",
    });
  });

  it("returns null when no raw auth user is provided", () => {
    expect(toAuthUserRecord(null)).to.equal(null);
  });
});
