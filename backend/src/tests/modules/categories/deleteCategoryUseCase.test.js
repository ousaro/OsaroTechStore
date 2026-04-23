import { describe, it } from "mocha";
import { expect } from "chai";
import { buildDeleteCategoryUseCase } from "../../../modules/categories/application/commands/deleteCategoryUseCase.js";
import { createCategoryDeletedEvent } from "../../../modules/categories/domain/events/CategoryDeleted.js";
import { assertCategoryEventPublisherPort } from "../../../modules/categories/ports/output/categoryEventPublisherPort.js";
import {
  CategoryNotFoundError,
  CategoryValidationError,
} from "../../../modules/categories/application/errors/CategoryApplicationError.js";
import { DomainValidationError } from "../../../shared/domain/errors/DomainValidationError.js";

describe("deleteCategoryUseCase", () => {
  it("publishes CategoryDeleted after deleting the category", async () => {
    const deletedCategory = { _id: "cat-1", name: "Phones" };
    const calls = [];
    const deleteCategoryUseCase = buildDeleteCategoryUseCase({
      categoryRepository: {
        findByIdAndDelete: async (id) => {
          calls.push(["deleteCategory", id]);
          return deletedCategory;
        },
      },
      categoryEventPublisher: {
        publish: async (event) => {
          calls.push(["publish", event]);
        },
      },
    });

    const result = await deleteCategoryUseCase({ id: "cat-1" });

    expect(result).to.deep.equal(deletedCategory);
    expect(calls).to.deep.equal([
      ["deleteCategory", "cat-1"],
      [
        "publish",
        {
          type: "CategoryDeleted",
          payload: {
            categoryId: "cat-1",
            name: "Phones",
          },
        },
      ],
    ]);
  });

  it("throws when the category id is missing", async () => {
    const deleteCategoryUseCase = buildDeleteCategoryUseCase({
      categoryRepository: {
        findByIdAndDelete: async () => null,
      },
      categoryEventPublisher: {
        publish: async () => {},
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

  it("requires the category event publisher dependency", () => {
    expect(() =>
      buildDeleteCategoryUseCase({
        categoryRepository: {
          findByIdAndDelete: async () => null,
        },
        categoryEventPublisher: {},
      })
    ).to.throw("categoryEventPublisher port must implement publish");

    expect(() =>
      assertCategoryEventPublisherPort(
        {
          publish: async () => {},
        },
        ["publish"]
      )
    ).to.not.throw();
  });

  it("throws when the category cannot be found", async () => {
    const deleteCategoryUseCase = buildDeleteCategoryUseCase({
      categoryRepository: {
        findByIdAndDelete: async () => null,
      },
      categoryEventPublisher: {
        publish: async () => {},
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

  it("creates a CategoryDeleted domain event with stable payload", () => {
    const event = createCategoryDeletedEvent({ _id: "cat-1", name: "Phones" });

    expect(event).to.deep.equal({
      type: "CategoryDeleted",
      payload: {
        categoryId: "cat-1",
        name: "Phones",
      },
    });
  });

  it("requires a category id when creating CategoryDeleted", () => {
    expect(() => createCategoryDeletedEvent({ name: "Phones" })).to.throw(
      DomainValidationError,
      "category id is required to create CategoryDeleted"
    );
  });
});
