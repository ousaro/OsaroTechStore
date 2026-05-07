import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";

const ctx = createIntegrationTestContext();

test("authenticated user can read and update their profile", async () => {
  const user = await ctx.createUser({ firstName: "Katherine", lastName: "Johnson" });

  const profileResponse = await ctx.client.agent
    .get("/api/users/me")
    .set(ctx.authHeadersFor(user))
    .expect(200);

  assert.equal(profileResponse.body._id, user._id.toString());
  assert.equal(profileResponse.body.email, user.email);
  assert.equal(profileResponse.body.firstName, "Katherine");

  const updateResponse = await ctx.client.agent
    .put("/api/users/me")
    .set(ctx.authHeadersFor(user))
    .send({
      firstName: "Kat",
      phone: "+212600000000",
      city: "Rabat",
      postalCode: 10000,
    })
    .expect(200);

  assert.equal(updateResponse.body.firstName, "Kat");
  assert.equal(updateResponse.body.phone, "+212600000000");
  assert.equal(updateResponse.body.city, "Rabat");
  assert.equal(updateResponse.body.postalCode, 10000);
});
