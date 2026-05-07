import test from "node:test";
import assert from "node:assert/strict";

import { createRequestClient } from "../../../shared/utils/requestClient.js";

const createFakeRequestFactory = (requests) => () =>
  ["get", "post", "put", "delete"].reduce((agent, method) => ({
    ...agent,
    [method]: (url) => {
      const request = {
        method,
        url,
        headers: {},
        body: undefined,
        set(headers) {
          this.headers = { ...this.headers, ...headers };
          return this;
        },
        send(body) {
          this.body = body;
          return this;
        },
      };
      requests.push(request);
      return request;
    },
  }), {});

test("requestClient.as(user) creates token-authenticated request methods", async () => {
  const requests = [];
  const user = { _id: "user-1" };
  const client = createRequestClient(null, {
    requestFactory: createFakeRequestFactory(requests),
    tokenForUser: (authUser) => `token-for-${authUser._id}`,
  });

  client.as(user).get("/echo");
  assert.equal(requests[0].method, "get");
  assert.equal(requests[0].url, "/echo");
  assert.deepEqual(requests[0].headers, {
    Authorization: "Bearer token-for-user-1",
  });

  client.as(user).post("/echo").send({ ok: true });
  assert.equal(requests[1].method, "post");
  assert.deepEqual(requests[1].headers, {
    Authorization: "Bearer token-for-user-1",
  });
  assert.deepEqual(requests[1].body, { ok: true });
});

test("requestClient.as(user) throws when no token signer is configured", () => {
  const client = createRequestClient(null, {
    requestFactory: createFakeRequestFactory([]),
  });

  assert.throws(
    () => client.as({ _id: "user-1" }),
    /requires a tokenForUser option/
  );
});
