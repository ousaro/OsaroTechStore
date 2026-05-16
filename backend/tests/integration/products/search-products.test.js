import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistCategory } from "../../shared/factories/categoryFactory.js";
import { buildProductPayload } from "../../shared/factories/productFactory.js";

const ctx = createIntegrationTestContext();

test("public product routes support category and status filters", async () => {
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
    overrides: { name: "Peripherals" },
  });
  const otherCategory = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
    overrides: { name: "Consoles" },
  });

  const activeProduct = await ctx.application.repositories.productRepository.create(
    buildProductPayload({
      category: category._id.toString(),
      name: "Mechanical Keyboard",
      status: "active",
    })
  );
  await ctx.application.repositories.productRepository.create(
    buildProductPayload({
      category: category._id.toString(),
      name: "Draft Mouse",
      status: "new",
    })
  );
  await ctx.application.repositories.productRepository.create(
    buildProductPayload({
      category: otherCategory._id.toString(),
      name: "Game Console",
      status: "active",
    })
  );

  const response = await ctx.client.agent
    .get(`/api/products?category=${category._id}&status=active`)
    .expect(200);

  assert.deepEqual(
    response.body.map((product) => product._id),
    [activeProduct._id.toString()]
  );
});

test("public product routes paginate list results", async () => {
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
    overrides: { name: "Pagination" },
  });

  await ctx.application.repositories.productRepository.create(
    buildProductPayload({ category: category._id.toString(), name: "First Product" })
  );
  const secondProduct = await ctx.application.repositories.productRepository.create(
    buildProductPayload({ category: category._id.toString(), name: "Second Product" })
  );
  const thirdProduct = await ctx.application.repositories.productRepository.create(
    buildProductPayload({ category: category._id.toString(), name: "Third Product" })
  );

  const response = await ctx.client.agent.get("/api/products?limit=2").expect(200);

  assert.deepEqual(
    response.body.map((product) => product._id),
    [thirdProduct._id.toString(), secondProduct._id.toString()]
  );
});
