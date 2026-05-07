import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../shared/utils/integrationTestContext.js";
import { persistUser } from "../shared/factories/userFactory.js";
import { persistCategory } from "../shared/factories/categoryFactory.js";
import { persistProduct } from "../shared/factories/productFactory.js";

const ctx = createIntegrationTestContext();

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("authenticated user can read and update their profile", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
    overrides: { firstName: "Katherine", lastName: "Johnson" },
  });

  const profileResponse = await ctx.client.agent
    .get("/api/users/me")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .expect(200);

  assert.equal(profileResponse.body._id, user._id.toString());
  assert.equal(profileResponse.body.email, user.email);
  assert.equal(profileResponse.body.firstName, "Katherine");

  const updateResponse = await ctx.client.agent
    .put("/api/users/me")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({
      firstName: "Kat",
      phone: "+212600000000",
      city: "Rabat",
      postalCode: 10000,
    })
    .expect(200);

  assert.equal(updateResponse.body.firstName, "Kat");
  assert.equal(updateResponse.body.phone, "+212600000000");
  assert.equal(updateResponse.body.city, "Rabat");
  assert.equal(updateResponse.body.postalCode, 10000);
});

test("authenticated user can maintain cart and favorites", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
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
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({ cart })
    .expect(200);

  assert.deepEqual(cartResponse.body.cart, cart);

  const addFavoriteResponse = await ctx.client.agent
    .put(`/api/users/me/favorites/${product._id}`)
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({ action: "add" })
    .expect(200);

  assert.deepEqual(addFavoriteResponse.body.favorites, [product._id.toString()]);

  const repeatedFavoriteResponse = await ctx.client.agent
    .put(`/api/users/me/favorites/${product._id}`)
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({ action: "add" })
    .expect(200);

  assert.deepEqual(repeatedFavoriteResponse.body.favorites, [product._id.toString()]);

  const removeFavoriteResponse = await ctx.client.agent
    .put(`/api/users/me/favorites/${product._id}`)
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({ action: "remove" })
    .expect(200);

  assert.deepEqual(removeFavoriteResponse.body.favorites, []);
});

test("users routes require authentication and admin-only profile lookups", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });

  await ctx.client.agent.get("/api/users/me").expect(401);

  await ctx.client.agent
    .get(`/api/users/${user._id}`)
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .expect(403);
});
