import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistAdminUser, persistUser } from "../../shared/factories/userFactory.js";

const ctx = createIntegrationTestContext();

test("GET /api/auth/users requires a valid admin token", async () => {
  await ctx.client.agent.get("/api/auth/users").expect(401);

  const normalUser = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const normalToken = ctx.application.tokenService.signUserId(normalUser._id);

  await ctx.client.agent
    .get("/api/auth/users")
    .set("Authorization", `Bearer ${normalToken}`)
    .expect(403);

  const admin = await persistAdminUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const adminToken = ctx.application.tokenService.signUserId(admin._id);

  const response = await ctx.client.agent
    .get("/api/auth/users")
    .set("Authorization", `Bearer ${adminToken}`)
    .expect(200);

  assert.equal(Array.isArray(response.body), true);
});

test("admin can manage user accounts without exposing password hashes", async () => {
  const admin = await persistAdminUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
    overrides: { firstName: "Grace", lastName: "Hopper", email: "grace@example.test" },
  });
  const adminToken = ctx.application.tokenService.signUserId(admin._id);

  const listResponse = await ctx.client.agent
    .get("/api/auth/users")
    .set("Authorization", `Bearer ${adminToken}`)
    .expect(200);

  assert.deepEqual(
    listResponse.body.map((listedUser) => listedUser.email),
    ["grace@example.test"]
  );
  assert.equal("password" in listResponse.body[0], false);

  const getResponse = await ctx.client.agent
    .get(`/api/auth/users/${user._id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .expect(200);

  assert.equal(getResponse.body.email, "grace@example.test");
  assert.equal("password" in getResponse.body, false);

  const updateResponse = await ctx.client.agent
    .put(`/api/auth/users/${user._id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ firstName: "Amazing", lastName: "Admiral" })
    .expect(200);

  assert.equal(updateResponse.body.firstName, "Amazing");
  assert.equal(updateResponse.body.lastName, "Admiral");

  await ctx.client.agent
    .delete(`/api/auth/users/${user._id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .expect(200);

  const listAfterDeleteResponse = await ctx.client.agent
    .get("/api/auth/users")
    .set("Authorization", `Bearer ${adminToken}`)
    .expect(200);

  assert.equal(
    listAfterDeleteResponse.body.some((listedUser) => listedUser.email === "grace@example.test"),
    false
  );
});

test("admin user listing supports pagination", async () => {
  const admin = await persistAdminUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const adminToken = ctx.application.tokenService.signUserId(admin._id);

  await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
    overrides: { email: "first-page-user@example.test" },
  });
  const secondUser = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
    overrides: { email: "second-page-user@example.test" },
  });
  const thirdUser = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
    overrides: { email: "third-page-user@example.test" },
  });

  const response = await ctx.client.agent
    .get("/api/auth/users?limit=2")
    .set("Authorization", `Bearer ${adminToken}`)
    .expect(200);

  assert.deepEqual(
    response.body.map((user) => user.email),
    [thirdUser.email, secondUser.email]
  );
});
