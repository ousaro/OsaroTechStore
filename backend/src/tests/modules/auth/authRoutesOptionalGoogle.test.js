import { describe, it } from "mocha";
import { expect } from "chai";
import { createAuthRoutes } from "../../../modules/auth/adapters/input/http/authRoutes.js";

describe("authRoutes without Google OAuth configuration", () => {
  it("returns 503 instead of crashing when Google OAuth is disabled", async () => {
    const authRoutes = createAuthRoutes({
      googleOAuthEnabled: false,
    });
    const googleRouteLayer = authRoutes._router.stack.find((layer) => layer.route?.path === "/google");
    expect(googleRouteLayer).to.exist;

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

    googleRouteLayer.route.stack[0].handle({}, res);

    expect(responseState).to.deep.equal({
      status: 503,
      body: {
        message: "Google OAuth is not configured for this environment",
      },
    });
  });
});
