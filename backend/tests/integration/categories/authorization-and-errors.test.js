import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistCategory } from "../../shared/factories/categoryFactory.js";

const ctx = createIntegrationTestContext();

test("category write routes reject missing and non-admin credentials", async () => {
  const user = await ctx.createUser();
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
  });

  await ctx.client.agent.put(`/api/categories/${category._id}`).send({ name: "Audio" }).expect(401);
  await ctx.client.agent.delete(`/api/categories/${category._id}`).expect(401);

  await ctx.client.agent
    .put(`/api/categories/${category._id}`)
    .set(ctx.authHeadersFor(user))
    .send({ name: "Audio" })
    .expect(403);

  await ctx.client.agent
    .delete(`/api/categories/${category._id}`)
    .set(ctx.authHeadersFor(user))
    .expect(403);
});

test("admin category update and delete return structured errors for missing categories", async () => {
  const admin = await ctx.createAdmin();
  const headers = ctx.authHeadersFor(admin);

  const updateResponse = await ctx.client.agent
    .put("/api/categories/64f000000000000000000000")
    .set(headers)
    .send({ name: "Missing" })
    .expect(404);

  assert.equal(updateResponse.body.error.code, "NOT_FOUND");

  const deleteResponse = await ctx.client.agent
    .delete("/api/categories/64f000000000000000000000")
    .set(headers)
    .expect(404);

  assert.equal(deleteResponse.body.error.code, "NOT_FOUND");
});
