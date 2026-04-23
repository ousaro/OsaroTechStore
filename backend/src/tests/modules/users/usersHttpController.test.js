import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createUsersHttpController } from "../../../modules/users/adapters/http/usersHttpController.js";

describe("users http controller", () => {
  it("returns user payloads without password fields", async () => {
    const usersInputPort = {
      getAllUsers: sinon.stub().resolves([
        { _id: "u1", email: "jane@example.com", admin: false },
      ]),
      getUserById: sinon.stub().resolves({ _id: "u1" }),
      updateUser: sinon.stub().resolves({ _id: "u1" }),
      updateUserPassword: sinon.stub().resolves({ _id: "u1" }),
      deleteUser: sinon.stub().resolves({ _id: "u1" }),
    };
    const { getAllUsersHandler } = createUsersHttpController({ usersInputPort });
    const captured = {};
    const res = {
      status(code) {
        captured.statusCode = code;
        return this;
      },
      json(body) {
        captured.body = body;
        return this;
      },
    };

    await getAllUsersHandler({}, res, (error) => {
      if (error) {
        throw error;
      }
    });

    expect(captured.statusCode).to.equal(200);
    expect(captured.body).to.deep.equal([
      { _id: "u1", email: "jane@example.com", admin: false },
    ]);
    expect("password" in captured.body[0]).to.equal(false);
  });
});
