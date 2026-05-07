import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistAdminUser, persistUser } from "../../shared/factories/userFactory.js";
import { persistCategory } from "../../shared/factories/categoryFactory.js";
import { buildProductPayload } from "../../shared/factories/productFactory.js";

const ctx = createIntegrationTestContext();

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("admin can create products through route, middleware, controller, use case, and DB", async () => {
  const admin = await persistAdminUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
  });

  const response = await ctx.client.agent
    .post("/api/products")
    .set("Authorization", `Bearer ${tokenFor(admin)}`)
    .send(
      buildProductPayload({
        category: category._id.toString(),
        name: "ThinkPad X1",
        price: 1299,
      })
    )
    .expect(201);

  assert.equal(response.body.name, "ThinkPad X1");
  assert.equal(response.body.category, category._id.toString());

  const persisted = await ctx.application.repositories.productRepository.findById(
    response.body._id
  );
  assert.equal(persisted.name, "ThinkPad X1");
});

test("non-admin users cannot create products", async () => {
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

test("product creation returns structured validation errors", async () => {
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
