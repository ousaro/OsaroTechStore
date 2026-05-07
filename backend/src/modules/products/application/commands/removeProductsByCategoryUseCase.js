import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const buildRemoveProductsByCategoryUseCase =
  ({ productRepository, logger }) =>
  async ({ categoryId }) => {
    assertNonEmptyString(categoryId, "categoryId");
    const count = await productRepository.deleteByCategoryId(categoryId);
    logger?.info({ msg: "Products removed by category", categoryId, count });
    return { deleted: count };
  };
