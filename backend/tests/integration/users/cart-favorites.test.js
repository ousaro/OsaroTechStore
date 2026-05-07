import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistCategory } from "../../shared/factories/categoryFactory.js";
import { persistProduct } from "../../shared/factories/productFactory.js";

const ctx = createIntegrationTestContext();

test("authenticated user can maintain cart and favorites", async () => {
  const user = await ctx.createUser();
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
  });
  const product = await persistProduct({
    productRepository: ctx.application.repositories.productRepository,
    category: category._id.toString(),
  });

  const cart = [
    {
      productId: product._id.toString(),
      name: product.name,
      price: product.price,
      quantity: 2,
    },
  ];

  const cartResponse = await ctx.client.agent
    .put("/api/users/me/cart")
    .set(ctx.authHeadersFor(user))
    .send({ cart })
    .expect(200);

  assert.deepEqual(cartResponse.body.cart, cart);

  const addFavoriteResponse = await ctx.client.agent
    .put(`/api/users/me/favorites/${product._id}`)
    .set(ctx.authHeadersFor(user))
    .send({ action: "add" })
    .expect(200);

  assert.deepEqual(addFavoriteResponse.body.favorites, [product._id.toString()]);

  const repeatedFavoriteResponse = await ctx.client.agent
    .put(`/api/users/me/favorites/${product._id}`)
    .set(ctx.authHeadersFor(user))
    .send({ action: "add" })
    .expect(200);

  assert.deepEqual(repeatedFavoriteResponse.body.favorites, [product._id.toString()]);

  const removeFavoriteResponse = await ctx.client.agent
    .put(`/api/users/me/favorites/${product._id}`)
    .set(ctx.authHeadersFor(user))
    .send({ action: "remove" })
    .expect(200);

  assert.deepEqual(removeFavoriteResponse.body.favorites, []);
});
