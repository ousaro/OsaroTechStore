import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../shared/utils/integrationTestContext.js";
import { persistAdminUser, persistUser } from "../shared/factories/userFactory.js";
import { buildCategoryPayload, persistCategory } from "../shared/factories/categoryFactory.js";
import { buildProductPayload } from "../shared/factories/productFactory.js";

const ctx = createIntegrationTestContext();

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("admin can create, list, update, and delete catalog resources", async () => {
  const admin = await persistAdminUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const token = tokenFor(admin);

  const categoryResponse = await ctx.client.agent
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send(buildCategoryPayload({ name: "Laptops" }))
    .expect(201);

  const categoryId = categoryResponse.body._id;
  assert.equal(categoryResponse.body.name, "Laptops");

  const productPayload = buildProductPayload({
    category: categoryId,
    name: "ThinkPad X1",
    price: 1299,
  });

  const productResponse = await ctx.client.agent
    .post("/api/products")
    .set("Authorization", `Bearer ${token}`)
    .send(productPayload)
    .expect(201);

  assert.equal(productResponse.body.name, "ThinkPad X1");
  assert.equal(productResponse.body.category, categoryId);

  const listResponse = await ctx.client.agent
    .get(`/api/products?category=${categoryId}`)
    .expect(200);

  assert.equal(listResponse.body.length, 1);

  const updateResponse = await ctx.client.agent
    .put(`/api/products/${productResponse.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ stock: 5, status: "active" })
    .expect(200);

  assert.equal(updateResponse.body.stock, 5);

  await ctx.client.agent
    .delete(`/api/products/${productResponse.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  await ctx.client.agent
    .get(`/api/products/${productResponse.body._id}`)
    .expect(404);
});

test("non-admin users cannot mutate catalog resources", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
  });

  await ctx.client.agent
    .post("/api/products")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send(buildProductPayload({ category: category._id.toString() }))
    .expect(403);
});

test("catalog validation errors are returned with structured error payloads", async () => {
  const admin = await persistAdminUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });

  const response = await ctx.client.agent
    .post("/api/products")
    .set("Authorization", `Bearer ${tokenFor(admin)}`)
    .send(buildProductPayload({ category: "", price: -10 }))
    .expect(400);

  assert.equal(response.body.error.code, "VALIDATION");
  assert.match(response.body.error.message, /category|price/i);
});

test("deleting a category removes its products through module collaboration", async () => {
  const admin = await persistAdminUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
    overrides: { name: "Accessories" },
  });
  const product = await ctx.application.repositories.productRepository.create(
    buildProductPayload({
      category: category._id.toString(),
      name: "USB-C Dock",
    })
  );

  await ctx.client.agent
    .delete(`/api/categories/${category._id}`)
    .set("Authorization", `Bearer ${tokenFor(admin)}`)
    .expect(200);

  await ctx.client.agent
    .get(`/api/categories/${category._id}`)
    .expect(404);

  await ctx.client.agent
    .get(`/api/products/${product._id}`)
    .expect(404);
});
