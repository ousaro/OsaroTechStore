import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createInProcessEventBus } from "../../shared/infrastructure/events/createInProcessEventBus.js";
import { registerApplicationWorkflows } from "../../app/registerApplicationWorkflows.js";
import { buildDeleteCategoryUseCase } from "../../modules/categories/application/use-cases/deleteCategoryUseCase.js";

describe("cross-module workflows", () => {
  it("registers CategoryDeleted workflow subscriptions in the application workflow registry", async () => {
    const eventBus = createInProcessEventBus();
    const removeProductsByCategory = sinon.stub().resolves();
    const createCategoryDeletedTranslator = sinon.spy(({ removeProductsByCategory }) => ({
      publish: (event) => removeProductsByCategory({ categoryId: event.payload.categoryId }),
    }));

    const unsubscribes = registerApplicationWorkflows({
      eventBus,
      createCategoryDeletedTranslator,
      removeProductsByCategoryHandler: removeProductsByCategory,
    });

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
    expect(unsubscribes).to.have.lengthOf(1);
    expect(createCategoryDeletedTranslator.calledOnce).to.equal(true);
    expect(removeProductsByCategory.calledOnceWithExactly({
      categoryId: "cat-1",
    })).to.equal(true);
  });
});
