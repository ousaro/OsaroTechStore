import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  buildUserPayload,
  persistAdminUser,
  persistUser,
} from "../../shared/factories/userFactory.js";

Given("a visitor named {word}", function (name) {
  this.users.set(
    name,
    buildUserPayload({
      firstName: name,
      email: `${name.toLowerCase()}@example.test`,
    })
  );
  this.setActor(name);
});

Given("a registered customer named {word}", async function (name) {
  const user = await persistUser({
    authUserRepository: this.application.repositories.authUserRepository,
    overrides: {
      firstName: name,
      email: `${name.toLowerCase()}@example.test`,
      password: "Password123!",
    },
  });
  this.users.set(name, { ...user, password: "Password123!" });
  this.tokens.set(name, this.application.tokenService.signUserId(user._id));
  this.setActor(name);
});

Given("an admin user named {word}", async function (name) {
  const user = await persistAdminUser({
    authUserRepository: this.application.repositories.authUserRepository,
    overrides: {
      firstName: name,
      email: `${name.toLowerCase()}@example.test`,
      password: "Password123!",
    },
  });
  this.users.set(name, { ...user, password: "Password123!" });
  this.tokens.set(name, this.application.tokenService.signUserId(user._id));
});

When("{word} registers for an account", async function (name) {
  this.setActor(name);
  const payload = this.users.get(name);
  await this.apiPost("/api/auth/register", payload);
  if (this.lastResponse.status() === 201) {
    const body = await this.responseJson();
    this.users.set(name, { ...payload, ...body });
    this.tokens.set(name, body.token);
  }
});

When("{word} logs in with valid credentials", async function (name) {
  this.setActor(name);
  const user = this.users.get(name);
  await this.apiPost("/api/auth/login", {
    email: user.email,
    password: user.password,
  });
  if (this.lastResponse.status() === 200) {
    const body = await this.responseJson();
    this.tokens.set(name, body.token);
  }
});

When("{word} requests the managed user list", async function (name) {
  this.setActor(name);
  await this.apiGet("/api/auth/users", this.tokenFor(name));
});

When("{word} places an order with an expired token", async function (name) {
  this.setActor(name);
  const user = this.users.get(name);
  const expiredToken = jwt.sign({ _id: user._id }, this.application.env.tokenSecret, {
    expiresIn: "-1s",
  });
  await this.apiPost("/api/orders", {}, expiredToken);
});

Then("the response status should be {int}", function (statusCode) {
  assert.equal(this.lastResponse.status(), statusCode);
});

Then("{word} should receive a JWT token", async function (name) {
  const body = await this.responseJson();
  assert.equal(typeof body.token, "string");
  assert.ok(body.token.length > 20);
  this.tokens.set(name, body.token);
});
