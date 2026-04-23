import { describe, it } from "mocha";
import { expect } from "chai";
import { buildUpdateProductUseCase } from "../../../modules/products/application/commands/updateProductUseCase.js";
import { ProductNotFoundError } from "../../../modules/products/application/errors/ProductApplicationError.js";

describe("updateProductUseCase", () => {
  it("reuses the current discount when only raw price changes", async () => {
    let persistedPatch = null;
    const updateProductUseCase = buildUpdateProductUseCase({
      productRepository: {
        isValidId: () => true,
        findById: async () => ({ _id: "p1", raw_price: 1000, discount: 10 }),
        findByIdAndUpdate: async (_id, patch) => {
          persistedPatch = patch.toPrimitives();
          return { _id: "p1", ...persistedPatch };
        },
      },
    });

    const result = await updateProductUseCase({
      id: "p1",
      updates: { raw_price: 1200 },
    });

    expect(persistedPatch).to.deep.equal({
      raw_price: 1200,
      price: 1080,
    });
    expect(result).to.deep.equal({
      _id: "p1",
      price: 1080,
    });
  });

  it("reuses the current raw price when only discount changes", async () => {
    let persistedPatch = null;
    const updateProductUseCase = buildUpdateProductUseCase({
      productRepository: {
        isValidId: () => true,
        findById: async () => ({ _id: "p1", raw_price: 1000, discount: 10 }),
        findByIdAndUpdate: async (_id, patch) => {
          persistedPatch = patch.toPrimitives();
          return { _id: "p1", ...persistedPatch };
        },
      },
    });

    await updateProductUseCase({
      id: "p1",
      updates: { discount: 25 },
    });

    expect(persistedPatch).to.deep.equal({
      discount: 25,
      price: 750,
    });
  });

  it("throws when the product id is invalid", async () => {
    const updateProductUseCase = buildUpdateProductUseCase({
      productRepository: {
        isValidId: () => false,
        findById: async () => null,
        findByIdAndUpdate: async () => null,
      },
    });

    try {
      await updateProductUseCase({ id: "bad-id", updates: { name: "Phone" } });
      expect.fail("Expected updateProductUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(ProductNotFoundError);
      expect(error.message).to.equal("Invalid Product ID");
      expect(error.code).to.equal("PRODUCT_NOT_FOUND");
    }
  });
});
