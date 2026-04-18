import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { errorMiddleware } from "../../shared/infrastructure/http/errorMiddleware.js";

describe("errorMiddleware", () => {
  it("returns structured error using error + meta", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    const err = new Error("Invalid input");
    err.statusCode = 400;
    err.meta = { emptyFields: ["name"] };

    errorMiddleware(err, req, res, () => {});

    expect(res.status.calledWith(400)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("Invalid input");
    expect(body.emptyFields).to.deep.equal(["name"]);
    expect(body.stack).to.be.a("string");
  });

  it("maps malformed JSON syntax errors to 400", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    const err = new SyntaxError("Unexpected token");
    err.status = 400;
    err.body = "{ bad json";

    errorMiddleware(err, req, res, () => {});

    expect(res.status.calledWith(400)).to.equal(true);
    expect(res.json.firstCall.args[0]).to.deep.equal({
      error: "Malformed JSON request body",
    });
  });
});
