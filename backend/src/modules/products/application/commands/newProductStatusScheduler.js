import { PRODUCT_STATUSES } from "../../domain/entities/Product.js";

export const buildNewProductStatusScheduler = ({ productRepository, logger }) => ({
  name: "newProductStatusScheduler",
  start() {
    const INTERVAL_MS = 24 * 60 * 60 * 1000;
    const run = async () => {
      try {
        const cutoff = new Date(Date.now() - INTERVAL_MS);
        const count  = await productRepository.updateStatusBefore({
          fromStatus: PRODUCT_STATUSES.NEW,
          toStatus:   PRODUCT_STATUSES.ACTIVE,
          before:     cutoff,
        });
        if (count > 0) {
          logger?.info({ msg: "Scheduler: new->active products updated", count });
        }
      } catch (err) {
        logger?.error({ msg: "Scheduler: failed to update product statuses", error: err.message });
      }
    };
    run();
    return setInterval(run, INTERVAL_MS);
  },
});
