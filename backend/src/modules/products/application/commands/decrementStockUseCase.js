export const buildDecrementStockUseCase =
  ({ productRepository, logger }) =>
  async ({ items }) => {
    const results = await productRepository.decrementStock(items);
    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      logger?.warn({
        msg: "Stock decrement failed for some items",
        failures,
      });
    }
    logger?.info({ msg: "Stock decremented", total: results.length, failed: failures.length });
    return results;
  };
