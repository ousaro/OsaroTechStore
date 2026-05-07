import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistAdminUser } from "../../shared/factories/userFactory.js";
import { persistCategory } from "../../shared/factories/categoryFactory.js";
import { persistProduct } from "../../shared/factories/productFactory.js";

const ctx = createIntegrationTestContext();

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("admin can update and delete products through HTTP and DB", async () => {
  const admin = await persistAdminUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
  });
  const product = await persistProduct({
    productRepository: ctx.application.repositories.productRepository,
    category: category._id.toString(),
  });

  const updateResponse = await ctx.client.agent
    .put(`/api/products/${product._id}`)
    .set("Authorization", `Bearer ${tokenFor(admin)}`)
    .send({ stock: 5, status: "active" })
    .expect(200);

  assert.equal(updateResponse.body.stock, 5);

  await ctx.client.agent
    .delete(`/api/products/${product._id}`)
    .set("Authorization", `Bearer ${tokenFor(admin)}`)
    .expect(200);

  await ctx.client.agent.get(`/api/products/${product._id}`).expect(404);
});
