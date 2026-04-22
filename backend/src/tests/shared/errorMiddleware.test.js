import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { errorMiddleware } from "../../shared/infrastructure/http/errorMiddleware.js";
import { AuthUnauthorizedError } from "../../modules/auth/application/errors/AuthApplicationError.js";
import { OrderNotFoundError } from "../../modules/orders/application/errors/OrderApplicationError.js";
import { DomainValidationError } from "../../shared/domain/errors/DomainValidationError.js";

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

  it("maps application error codes to transport status codes", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    errorMiddleware(new AuthUnauthorizedError("Authorization token required"), req, res, () => {});

    expect(res.status.calledWith(401)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("Authorization token required");
    expect(body.stack).to.be.a("string");
  });

  it("maps domain validation errors to 400 while preserving meta", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    errorMiddleware(
      new DomainValidationError("Please fill in all the fields", {
        meta: { emptyFields: ["name"] },
      }),
      req,
      res,
      () => {}
    );

    expect(res.status.calledWith(400)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("Please fill in all the fields");
    expect(body.emptyFields).to.deep.equal(["name"]);
    expect(body.stack).to.be.a("string");
  });

  it("maps order application errors to 404", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    errorMiddleware(new OrderNotFoundError("Order not found"), req, res, () => {});

    expect(res.status.calledWith(404)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("Order not found");
    expect(body.stack).to.be.a("string");
  });
});
