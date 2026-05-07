import { before, after, beforeEach } from "node:test";
import { createMongoMemoryTestServer } from "./mongoMemoryServer.js";
import { createTestApplication } from "./testApp.js";
import { createRequestClient } from "./requestClient.js";
import { bearer } from "../builders/authHeaders.js";
import { persistAdminUser, persistUser } from "../factories/userFactory.js";

export const createIntegrationTestContext = ({ paymentGateway } = {}) => {
  const state = {};

  before(async () => {
    state.mongo = createMongoMemoryTestServer();
    const dbClient = await state.mongo.connect();
    state.application = createTestApplication({ dbClient, paymentGateway });
    state.client = createRequestClient(state.application.app, {
      tokenForUser: (user) => state.application.tokenService.signUserId(user._id),
    });
  });

  beforeEach(async () => {
    await state.mongo.cleanup();
    paymentGateway?.reset?.();
  });

  after(async () => {
    await state.mongo.disconnect();
  });

  return Object.assign(state, {
    tokenFor(user) {
      return state.application.tokenService.signUserId(user._id);
    },

    authHeadersFor(user) {
      return bearer(this.tokenFor(user));
    },

    createUser(overrides = {}) {
      return persistUser({
        authUserRepository: state.application.repositories.authUserRepository,
        overrides,
      });
    },

    createAdmin(overrides = {}) {
      return persistAdminUser({
        authUserRepository: state.application.repositories.authUserRepository,
        overrides,
      });
    },
  });
};
