import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { startApplication } from "../../app/startApplication.js";

describe("startApplication", () => {
  it("connects infrastructure, starts runtime hooks, and listens through one bootstrap path", async () => {
    const calls = [];
    const fakeServer = { close: sinon.spy() };
    const logger = { log: sinon.spy() };
    const app = {
      listen(port, onListen) {
        calls.push(["listen", port]);
        onListen();
        return fakeServer;
      },
    };

    const server = await startApplication({
      mongoUri: "mongodb://localhost:27017/osaro-test",
      port: 5000,
      connectDatabase: async (mongoUri) => {
        calls.push(["connectDatabase", mongoUri]);
      },
      createHttpApp: () => {
        calls.push(["createHttpApp"]);
        return app;
      },
      startRuntimeHooks: () => {
        calls.push(["startRuntimeHooks"]);
      },
      logger,
    });

    expect(server).to.equal(fakeServer);
    expect(calls).to.deep.equal([
      ["connectDatabase", "mongodb://localhost:27017/osaro-test"],
      ["createHttpApp"],
      ["startRuntimeHooks"],
      ["listen", 5000],
    ]);
    expect(logger.log.callCount).to.equal(2);
  });
});
