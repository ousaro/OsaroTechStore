import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistAdminUser } from "../../shared/factories/userFactory.js";
import { buildCategoryPayload } from "../../shared/factories/categoryFactory.js";

const ctx = createIntegrationTestContext();

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("admin can create, read, update, and delete categories through HTTP and DB", async () => {
  const admin = await persistAdminUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const token = tokenFor(admin);

  const createResponse = await ctx.client.agent
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send(buildCategoryPayload({ name: "Laptops" }))
    .expect(201);

  assert.equal(createResponse.body.name, "Laptops");

  const getResponse = await ctx.client.agent
    .get(`/api/categories/${createResponse.body._id}`)
    .expect(200);

  assert.equal(getResponse.body.name, "Laptops");

  const updateResponse = await ctx.client.agent
    .put(`/api/categories/${createResponse.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Business Laptops" })
    .expect(200);

  assert.equal(updateResponse.body.name, "Business Laptops");

  await ctx.client.agent
    .delete(`/api/categories/${createResponse.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  await ctx.client.agent
    .get(`/api/categories/${createResponse.body._id}`)
    .expect(404);
});
