import { describe, it } from "mocha";
import { expect } from "chai";
import { createAuthRoutes } from "../../../modules/auth/adapters/input/http/authRoutes.js";

describe("authRoutes provider strategies", () => {
  it("returns 503 for providers that are declared but not implemented yet", async () => {
    const authRoutes = createAuthRoutes({
      oauthProviders: {
        google: {
          enabled: false,
          configured: false,
          clientId: "",
          clientSecret: "",
          callbackUrl: "",
        },
        github: {
          enabled: true,
          configured: false,
          clientId: "",
          clientSecret: "",
          callbackUrl: "",
        },
        linkedin: {
          enabled: false,
          configured: false,
          clientId: "",
          clientSecret: "",
          callbackUrl: "",
        },
      },
    });
    const githubRouteLayer = authRoutes._router.stack.find((layer) => layer.route?.path === "/github");
    expect(githubRouteLayer).to.exist;

    const responseState = {};
    const res = {
      status(code) {
        responseState.status = code;
        return this;
      },
      json(body) {
        responseState.body = body;
        return this;
      },
    };

    githubRouteLayer.route.stack[0].handle({}, res);

    expect(responseState).to.deep.equal({
      status: 503,
      body: {
        message: "GitHub OAuth is not configured for this environment",
      },
    });
  });
});
