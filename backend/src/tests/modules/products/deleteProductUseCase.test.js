import { describe, it } from "mocha";
import { expect } from "chai";
import { buildDeleteProductUseCase } from "../../../modules/products/application/commands/deleteProductUseCase.js";
import { ProductNotFoundError } from "../../../modules/products/application/errors/ProductApplicationError.js";

describe("deleteProductUseCase", () => {
  it("returns the deleted product when the repository deletes it", async () => {
    const deletedProduct = { _id: "507f1f77bcf86cd799439013", name: "Phone" };
    const deleteProductUseCase = buildDeleteProductUseCase({
      productRepository: {
        isValidId: () => true,
        findByIdAndDelete: async () => deletedProduct,
      },
    });

    const result = await deleteProductUseCase({ id: deletedProduct._id });

    expect(result).to.deep.equal(deletedProduct);
  });

  it("throws when the product id is invalid", async () => {
    const deleteProductUseCase = buildDeleteProductUseCase({
      productRepository: {
        isValidId: () => false,
        findByIdAndDelete: async () => null,
      },
    });

    try {
      await deleteProductUseCase({ id: "bad-id" });
      expect.fail("Expected deleteProductUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(ProductNotFoundError);
      expect(error.message).to.equal("No such Product");
      expect(error.code).to.equal("PRODUCT_NOT_FOUND");
    }
  });

  it("throws when the product cannot be found", async () => {
    const deleteProductUseCase = buildDeleteProductUseCase({
      productRepository: {
        isValidId: () => true,
        findByIdAndDelete: async () => null,
      },
    });

    try {
      await deleteProductUseCase({ id: "507f1f77bcf86cd799439013" });
      expect.fail("Expected deleteProductUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(ProductNotFoundError);
      expect(error.message).to.equal("Product not found");
      expect(error.code).to.equal("PRODUCT_NOT_FOUND");
    }
  });
});
