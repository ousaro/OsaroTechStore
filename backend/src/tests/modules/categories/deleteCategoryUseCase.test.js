import { describe, it } from "mocha";
import { expect } from "chai";
import { buildDeleteCategoryUseCase } from "../../../modules/categories/application/use-cases/deleteCategoryUseCase.js";
import {
  CategoryNotFoundError,
  CategoryValidationError,
} from "../../../modules/categories/application/errors/CategoryApplicationError.js";

describe("deleteCategoryUseCase", () => {
  it("removes products through the product input contract before deleting the category", async () => {
    const deletedCategory = { _id: "cat-1", name: "Phones" };
    const calls = [];
    const deleteCategoryUseCase = buildDeleteCategoryUseCase({
      categoryRepository: {
        findByIdAndDelete: async (id) => {
          calls.push(["deleteCategory", id]);
          return deletedCategory;
        },
      },
      productCategoryCleanup: {
        removeProductsByCategory: async ({ categoryId }) => {
          calls.push(["removeProductsByCategory", categoryId]);
        },
      },
    });

    const result = await deleteCategoryUseCase({ id: "cat-1" });

    expect(result).to.equal(deletedCategory);
    expect(calls).to.deep.equal([
      ["removeProductsByCategory", "cat-1"],
      ["deleteCategory", "cat-1"],
    ]);
  });

  it("throws when the category id is missing", async () => {
    const deleteCategoryUseCase = buildDeleteCategoryUseCase({
      categoryRepository: {
        findByIdAndDelete: async () => null,
      },
      productCategoryCleanup: {
        removeProductsByCategory: async () => {},
      },
    });

    try {
      await deleteCategoryUseCase({ id: "" });
      throw new Error("Expected use case to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(CategoryValidationError);
      expect(error.message).to.equal("Category ID is required");
      expect(error.code).to.equal("CATEGORY_VALIDATION");
    }
  });

  it("throws when the category cannot be found", async () => {
    const deleteCategoryUseCase = buildDeleteCategoryUseCase({
      categoryRepository: {
        findByIdAndDelete: async () => null,
      },
      productCategoryCleanup: {
        removeProductsByCategory: async () => {},
      },
    });

    try {
      await deleteCategoryUseCase({ id: "cat-1" });
      throw new Error("Expected use case to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(CategoryNotFoundError);
      expect(error.message).to.equal("Category not found");
      expect(error.code).to.equal("CATEGORY_NOT_FOUND");
    }
  });
});
