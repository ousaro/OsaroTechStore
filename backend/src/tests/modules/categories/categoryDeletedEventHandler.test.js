import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createInProcessEventBus } from "../../../shared/infrastructure/events/createInProcessEventBus.js";
import { createCategoryDeletedProductCleanupTranslator } from "../../../modules/categories/infrastructure/collaboration/categoryDeletedProductCleanupTranslator.js";

describe("CategoryDeleted event handler", () => {
  it("routes CategoryDeleted through the in-process event bus to product cleanup", async () => {
    const eventBus = createInProcessEventBus();
    const removeProductsByCategory = sinon.stub().resolves();
    const translator = createCategoryDeletedProductCleanupTranslator({
      removeProductsByCategory,
    });

    eventBus.subscribe("CategoryDeleted", (event) => translator.publish(event));

    await eventBus.publish({
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
});
