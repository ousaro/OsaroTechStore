import { assertProductRepositoryPort } from "../../ports/output/productRepositoryPort.js";

export const buildRefreshNewProductStatusUseCase = ({ productRepository }) => {
  assertProductRepositoryPort(productRepository, ["findAll", "updateNewStatus"]);
  return async () => {
    const currentDate = new Date();
    const products = await productRepository.findAll();

    for (const product of products) {
      const creationDate = new Date(product.createdAt);
      const daysSinceCreation = (currentDate - creationDate) / (1000 * 60 * 60 * 24);
      const isNewProduct = daysSinceCreation <= 30;

      if (product.isNewProduct !== isNewProduct) {
        await productRepository.updateNewStatus(product._id, isNewProduct);
      }
    }

    return { message: "Product statuses updated successfully" };
  };
};
