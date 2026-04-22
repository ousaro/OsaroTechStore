import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createInProcessEventBus } from "../../shared/infrastructure/events/createInProcessEventBus.js";
import { buildDeleteCategoryUseCase } from "../../modules/categories/application/use-cases/deleteCategoryUseCase.js";
import { createCategoryDeletedProductCleanupTranslator } from "../../modules/categories/infrastructure/collaboration/categoryDeletedProductCleanupTranslator.js";

describe("cross-module workflows", () => {
  it("propagates CategoryDeleted from categories through the event bus into product cleanup", async () => {
    const eventBus = createInProcessEventBus();
    const removeProductsByCategory = sinon.stub().resolves();
    const translator = createCategoryDeletedProductCleanupTranslator({
      removeProductsByCategory,
    });
    eventBus.subscribe("CategoryDeleted", (event) => translator.publish(event));

    const deleteCategoryUseCase = buildDeleteCategoryUseCase({
      categoryRepository: {
        findByIdAndDelete: async () => ({
          _id: "cat-1",
          name: "Phones",
        }),
      },
      categoryEventPublisher: eventBus,
    });

    const deletedCategory = await deleteCategoryUseCase({ id: "cat-1" });

    expect(deletedCategory).to.deep.equal({
      _id: "cat-1",
      name: "Phones",
    });
    expect(removeProductsByCategory.calledOnceWithExactly({
      categoryId: "cat-1",
    })).to.equal(true);
  });
});
