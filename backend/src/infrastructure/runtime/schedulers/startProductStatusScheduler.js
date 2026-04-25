
export const createProductStatusScheduler = ({
  productService,
}) => {
  return {
    start() {
      productService.startProductStatusScheduler();
    },
  };
};
