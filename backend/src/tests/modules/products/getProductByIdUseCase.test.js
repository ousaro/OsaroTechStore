import { describe, it } from "mocha";
import { expect } from "chai";
import { buildGetProductByIdUseCase } from "../../../modules/products/application/use-cases/getProductByIdUseCase.js";
import { ProductNotFoundError } from "../../../modules/products/application/errors/ProductApplicationError.js";

describe("getProductByIdUseCase", () => {
  it("returns the product with related products when the repository finds it", async () => {
    const product = { _id: "p1", name: "Phone" };
    const relatedProducts = [{ _id: "p2", name: "Case" }];
    const getProductByIdUseCase = buildGetProductByIdUseCase({
      productRepository: {
        findById: async () => product,
        findRelated: async () => relatedProducts,
      },
    });

    const result = await getProductByIdUseCase({ productId: "p1" });

    expect(result).to.deep.equal({
      product,
      relatedProducts,
    });
  });

  it("throws when the product cannot be found", async () => {
    const getProductByIdUseCase = buildGetProductByIdUseCase({
      productRepository: {
        findById: async () => null,
        findRelated: async () => [],
      },
    });

    try {
      await getProductByIdUseCase({ productId: "missing" });
      expect.fail("Expected getProductByIdUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(ProductNotFoundError);
      expect(error.message).to.equal("Product not found");
      expect(error.code).to.equal("PRODUCT_NOT_FOUND");
    }
  });
});
