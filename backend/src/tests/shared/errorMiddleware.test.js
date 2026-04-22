import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { CategoryNotFoundError, CategoryValidationError } from "../../modules/categories/application/errors/CategoryApplicationError.js";
import { errorMiddleware } from "../../shared/infrastructure/http/errorMiddleware.js";
import { HttpValidationError } from "../../shared/infrastructure/http/HttpValidationError.js";
import { AuthUnauthorizedError } from "../../modules/auth/application/errors/AuthApplicationError.js";
import { OrderNotFoundError } from "../../modules/orders/application/errors/OrderApplicationError.js";
import {
  PaymentValidationError,
  PaymentWebhookError,
} from "../../modules/payments/application/errors/PaymentApplicationError.js";
import { ProductNotFoundError } from "../../modules/products/application/errors/ProductApplicationError.js";
import { UserValidationError } from "../../modules/users/application/errors/UserApplicationError.js";
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

  it("maps user validation errors to 400", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    errorMiddleware(new UserValidationError("Current password is incorrect"), req, res, () => {});

    expect(res.status.calledWith(400)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("Current password is incorrect");
    expect(body.stack).to.be.a("string");
  });

  it("maps category validation errors to 400", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    errorMiddleware(new CategoryValidationError("Category ID is required"), req, res, () => {});

    expect(res.status.calledWith(400)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("Category ID is required");
    expect(body.stack).to.be.a("string");
  });

  it("maps product application errors to 404", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    errorMiddleware(new ProductNotFoundError("Product not found"), req, res, () => {});

    expect(res.status.calledWith(404)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("Product not found");
    expect(body.stack).to.be.a("string");
  });

  it("maps category application errors to 404", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    errorMiddleware(new CategoryNotFoundError("Category not found"), req, res, () => {});

    expect(res.status.calledWith(404)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("Category not found");
    expect(body.stack).to.be.a("string");
  });

  it("maps payment validation errors to 400", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    errorMiddleware(new PaymentValidationError("items must be a non-empty array"), req, res, () => {});

    expect(res.status.calledWith(400)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("items must be a non-empty array");
    expect(body.stack).to.be.a("string");
  });

  it("maps payment webhook errors to 400", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    errorMiddleware(new PaymentWebhookError("Webhook signature verification failed"), req, res, () => {});

    expect(res.status.calledWith(400)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("Webhook signature verification failed");
    expect(body.stack).to.be.a("string");
  });

  it("maps shared HTTP validation errors to 400 while preserving meta", () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    errorMiddleware(
      new HttpValidationError("Missing required fields", {
        meta: { emptyFields: ["email"] },
      }),
      req,
      res,
      () => {}
    );

    expect(res.status.calledWith(400)).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal("Missing required fields");
    expect(body.emptyFields).to.deep.equal(["email"]);
    expect(body.stack).to.be.a("string");
  });
});
