import { before, after, beforeEach } from "node:test";
import { createMongoMemoryTestServer } from "./mongoMemoryServer.js";
import { createTestApplication } from "./testApp.js";
import { createRequestClient } from "./requestClient.js";

export const createIntegrationTestContext = ({ paymentGateway } = {}) => {
  const state = {};

  before(async () => {
    state.mongo = createMongoMemoryTestServer();
    const dbClient = await state.mongo.connect();
    state.application = createTestApplication({ dbClient, paymentGateway });
    state.client = createRequestClient(state.application.app);
  });

  beforeEach(async () => {
    await state.mongo.cleanup();
  });

  after(async () => {
    await state.mongo.disconnect();
  });

  return state;
};
