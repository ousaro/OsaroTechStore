import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createCategoryDeletedProductCleanupTranslator } from "../../../modules/categories/infrastructure/collaboration/categoryDeletedProductCleanupTranslator.js";

describe("categoryDeletedProductCleanupTranslator", () => {
  it("translates CategoryDeleted into a product cleanup call", async () => {
    const removeProductsByCategory = sinon.stub().resolves();
    const translator = createCategoryDeletedProductCleanupTranslator({
      removeProductsByCategory,
    });

    await translator.publish({
      type: "CategoryDeleted",
      payload: {
        categoryId: "cat-1",
        name: "Phones",
      },
    });

    expect(removeProductsByCategory.calledOnceWithExactly({
      categoryId: "cat-1",
    })).to.equal(true);
  });

  it("ignores unrelated events", async () => {
    const removeProductsByCategory = sinon.stub().resolves();
    const translator = createCategoryDeletedProductCleanupTranslator({
      removeProductsByCategory,
    });

    await translator.publish({
      type: "CategoryRenamed",
      payload: {
        categoryId: "cat-1",
      },
    });

    expect(removeProductsByCategory.called).to.equal(false);
  });
});
