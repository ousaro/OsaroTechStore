import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildRefreshNewProductStatusUseCase } from "../../../modules/products/application/use-cases/refreshNewProductStatusUseCase.js";

describe("refreshNewProductStatusUseCase", () => {
  it("uses the business-shaped listedAt field instead of persistence timestamps", async () => {
    const currentDate = new Date("2026-04-22T00:00:00.000Z");
    const clock = sinon.useFakeTimers({ now: currentDate });
    const updateNewStatus = sinon.stub().resolves();

    const refreshNewProductStatusUseCase = buildRefreshNewProductStatusUseCase({
      productRepository: {
        findAll: async () => [
          {
            _id: "p-new",
            listedAt: "2026-04-10T00:00:00.000Z",
            isNewProduct: false,
          },
          {
            _id: "p-old",
            listedAt: "2026-03-01T00:00:00.000Z",
            isNewProduct: true,
          },
        ],
        updateNewStatus,
      },
    });

    const result = await refreshNewProductStatusUseCase();

    expect(result).to.deep.equal({
      message: "Product statuses updated successfully",
    });
    expect(updateNewStatus.callCount).to.equal(2);
    expect(updateNewStatus.firstCall.args).to.deep.equal(["p-new", true]);
    expect(updateNewStatus.secondCall.args).to.deep.equal(["p-old", false]);

    clock.restore();
  });
});
