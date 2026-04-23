import { describe, it } from "mocha";
import { expect } from "chai";
import { buildGetAllCategoriesUseCase } from "../../../modules/categories/application/queries/getAllCategoriesUseCase.js";

describe("getAllCategoriesUseCase", () => {
  it("returns category read models with description", async () => {
    const useCase = buildGetAllCategoriesUseCase({
      categoryRepository: {
        findAllSorted: async () => [
          {
            _id: "c1",
            name: "Phones",
            description: "Smartphones and accessories",
            image: "phones.png",
          },
        ],
      },
    });

    const result = await useCase();

    expect(result).to.deep.equal([
      {
        _id: "c1",
        name: "Phones",
        description: "Smartphones and accessories",
        image: "phones.png",
      },
    ]);
  });
});
