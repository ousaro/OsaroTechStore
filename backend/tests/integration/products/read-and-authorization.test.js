import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistCategory } from "../../shared/factories/categoryFactory.js";
import { persistProduct } from "../../shared/factories/productFactory.js";

const ctx = createIntegrationTestContext();

test("public product read returns a product by id and structured not-found errors", async () => {
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
  });
  const product = await persistProduct({
    productRepository: ctx.application.repositories.productRepository,
    category: category._id.toString(),
  });

  const response = await ctx.client.agent.get(`/api/products/${product._id}`).expect(200);

  assert.equal(response.body._id, product._id.toString());
  assert.equal(response.body.categoryId, category._id.toString());
  assert.equal(response.body.category, category.name);

  const missingResponse = await ctx.client.agent
    .get("/api/products/64f000000000000000000000")
    .expect(404);

  assert.equal(missingResponse.body.error.code, "NOT_FOUND");
});

test("product write routes reject missing and non-admin credentials", async () => {
  const user = await ctx.createUser();
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
  });
  const product = await persistProduct({
    productRepository: ctx.application.repositories.productRepository,
    category: category._id.toString(),
  });

  await ctx.client.agent.put(`/api/products/${product._id}`).send({ stock: 20 }).expect(401);
  await ctx.client.agent.delete(`/api/products/${product._id}`).expect(401);

  await ctx.client.agent
    .put(`/api/products/${product._id}`)
    .set(ctx.authHeadersFor(user))
    .send({ stock: 20 })
    .expect(403);

  await ctx.client.agent
    .delete(`/api/products/${product._id}`)
    .set(ctx.authHeadersFor(user))
    .expect(403);
});

test("admin product update and delete return structured errors for missing products", async () => {
  const admin = await ctx.createAdmin();
  const headers = ctx.authHeadersFor(admin);

  const updateResponse = await ctx.client.agent
    .put("/api/products/64f000000000000000000000")
    .set(headers)
    .send({ stock: 20 })
    .expect(404);

  assert.equal(updateResponse.body.error.code, "NOT_FOUND");

  const deleteResponse = await ctx.client.agent
    .delete("/api/products/64f000000000000000000000")
    .set(headers)
    .expect(404);

  assert.equal(deleteResponse.body.error.code, "NOT_FOUND");
});
