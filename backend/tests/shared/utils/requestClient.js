import request from "supertest";
import { bearer } from "../builders/authHeaders.js";

const METHODS = ["get", "post", "put", "delete"];

export const createRequestClient = (app, { tokenForUser, requestFactory = request } = {}) => {
  const agent = requestFactory(app);
  const withToken = (method, url, token) =>
    agent[method](url).set(token ? bearer(token) : {});

  const authenticatedClient = (user) => {
    if (!tokenForUser) {
      throw new Error("requestClient.as(user) requires a tokenForUser option");
    }

    const token = tokenForUser(user);
    return METHODS.reduce(
      (client, method) => ({
        ...client,
        [method]: (url) => withToken(method, url, token),
      }),
      { token }
    );
  };

  return {
    agent,
    as: authenticatedClient,
    get: (url, token) => withToken("get", url, token),
    post: (url, token) => withToken("post", url, token),
    put: (url, token) => withToken("put", url, token),
    delete: (url, token) => withToken("delete", url, token),
  };
};
