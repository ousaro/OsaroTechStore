import test from "node:test";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistAdminUser } from "../../shared/factories/userFactory.js";
import { persistCategory } from "../../shared/factories/categoryFactory.js";
import { buildProductPayload } from "../../shared/factories/productFactory.js";

const ctx = createIntegrationTestContext();

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("CategoryDeleted event removes products from that category", async () => {
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
