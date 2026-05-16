import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistCategory } from "../../shared/factories/categoryFactory.js";

const ctx = createIntegrationTestContext();

test("public category routes list and read categories", async () => {
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
    overrides: { name: "Peripherals" },
  });
  await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
    overrides: { name: "Consoles" },
  });

  const categoriesResponse = await ctx.client.agent.get("/api/categories").expect(200);

  assert.deepEqual(categoriesResponse.body.map((listedCategory) => listedCategory.name).sort(), [
    "Consoles",
    "Peripherals",
  ]);

  const categoryResponse = await ctx.client.agent
    .get(`/api/categories/${category._id}`)
    .expect(200);

  assert.equal(categoryResponse.body.name, "Peripherals");
});

test("public category read returns a structured error when the use case throws", async () => {
  const response = await ctx.client.get("/api/categories/000000000000000000000000").expect(404);

  assert.equal(response.body.error.code, "NOT_FOUND");
  assert.match(response.body.error.message, /Category .* not found/);
});

test("public category routes paginate list results", async () => {
  await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
    overrides: { name: "Audio" },
  });
  await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
    overrides: { name: "Cameras" },
  });
  await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
    overrides: { name: "Displays" },
  });

  const response = await ctx.client.agent.get("/api/categories?limit=2").expect(200);

  assert.deepEqual(
    response.body.map((category) => category.name),
    ["Audio", "Cameras"]
  );
});
