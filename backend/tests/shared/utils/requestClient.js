import request from "supertest";
import { bearer } from "../builders/authHeaders.js";

export const createRequestClient = (app) => {
  const agent = request(app);

  return {
    agent,
    get: (url, token) => agent.get(url).set(token ? bearer(token) : {}),
    post: (url, token) => agent.post(url).set(token ? bearer(token) : {}),
    put: (url, token) => agent.put(url).set(token ? bearer(token) : {}),
    delete: (url, token) => agent.delete(url).set(token ? bearer(token) : {}),
  };
};
