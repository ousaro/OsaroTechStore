import cron from "node-cron";

export const createNewProductStatusScheduler = ({
  refreshNewProductStatusUseCase,
  logger = console,
}) => {
  return {
    start() {
      return cron.schedule("0 0 * * *", async () => {
        logger.log("Running the updateIsNewProductStatus function");

        try {
          await refreshNewProductStatusUseCase();
          logger.log("Product statuses updated successfully");
        } catch (error) {
          logger.error("Error updating product statuses:", error);
        }
      });
    },
  };
};
