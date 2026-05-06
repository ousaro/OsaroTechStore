import { createProduct }       from "../../domain/entities/Product.js";
import { toProductReadModel }  from "../read-models/productReadModel.js";

export const buildAddProductUseCase = ({ productRepository, logger }) =>
  async (data) => {
    const product = createProduct(data);
    const saved   = await productRepository.create(product.toPrimitives());
    logger?.info({ msg: "Product added", productId: saved._id });
    return toProductReadModel(saved);
  };
