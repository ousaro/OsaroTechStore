import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";

const ctx = createIntegrationTestContext();

test("authenticated user can read and update their profile", async () => {
  const user = await ctx.createUser({ firstName: "Katherine", lastName: "Johnson" });

  const profileResponse = await ctx.client.as(user).get("/api/users/me").expect(200);

  assert.equal(profileResponse.body._id, user._id.toString());
  assert.equal(profileResponse.body.email, user.email);
  assert.equal(profileResponse.body.firstName, "Katherine");

  const updateResponse = await ctx.client
    .as(user)
    .put("/api/users/me")
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

test("authenticated user can change their password", async () => {
  const user = await ctx.createUser({ password: "Password123!" });

  await ctx.client
    .as(user)
    .put("/api/users/me/password")
    .send({
      currentPassword: "Password123!",
      newPassword: "BetterPassword123!",
      confirmPassword: "BetterPassword123!",
    })
    .expect(200);

  await ctx.client
    .post("/api/auth/login")
    .send({ email: user.email, password: "Password123!" })
    .expect(401);

  await ctx.client
    .post("/api/auth/login")
    .send({ email: user.email, password: "BetterPassword123!" })
    .expect(200);
});

test("password change rejects incorrect current password", async () => {
  const user = await ctx.createUser({ password: "Password123!" });

  const response = await ctx.client
    .as(user)
    .put("/api/users/me/password")
    .send({
      currentPassword: "WrongPassword123!",
      newPassword: "BetterPassword123!",
      confirmPassword: "BetterPassword123!",
    })
    .expect(401);

  assert.equal(response.body.error.message, "Current password is incorrect");
});
