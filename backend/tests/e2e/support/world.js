import assert from "node:assert/strict";
import { setWorldConstructor, World } from "@cucumber/cucumber";

class ApiWorld extends World {
  constructor(options) {
    super(options);
    this.users = new Map();
    this.tokens = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.payments = new Map();
    this.lastResponse = null;
    this.currentActor = null;
  }

  setActor(name) {
    this.currentActor = name;
  }

  tokenFor(name = this.currentActor) {
    const token = this.tokens.get(name);
    assert.ok(token, `No token stored for actor "${name}"`);
    return token;
  }

  async apiGet(path, token) {
    this.lastResponse = await this.api.get(path, this.requestOptions(token));
    return this.lastResponse;
  }

  async apiPost(path, body, token) {
    this.lastResponse = await this.api.post(path, {
      ...this.requestOptions(token),
      data: body,
    });
    return this.lastResponse;
  }

  async apiPut(path, body, token) {
    this.lastResponse = await this.api.put(path, {
      ...this.requestOptions(token),
      data: body,
    });
    return this.lastResponse;
  }

  requestOptions(token) {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  async responseJson() {
    assert.ok(this.lastResponse, "No API response has been captured");
    return this.lastResponse.json();
  }
}

setWorldConstructor(ApiWorld);
