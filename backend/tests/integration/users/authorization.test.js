import test from "node:test";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";

const ctx = createIntegrationTestContext();

test("users routes require authentication and admin-only profile lookups", async () => {
  const user = await ctx.createUser();

  await ctx.client.agent.get("/api/users/me").expect(401);

  await ctx.client.agent
    .get(`/api/users/${user._id}`)
    .set(ctx.authHeadersFor(user))
    .expect(403);
});
