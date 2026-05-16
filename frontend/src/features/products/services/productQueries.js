import { Product } from "../model/Product.js";
import { asArray } from "../../../lib/apiData.js";

export function createProductQueries({ products: productRepository, sessionStore }) {
  const tok = () => sessionStore.get()?.token;

  async function getAllProducts(params = {}) {
    const { ok, data } = await productRepository.getAll(params, tok());
    return ok ? asArray(data).map((r) => new Product(r)) : [];
  }

  async function getProductById(id) {
    const { ok, data, error } = await productRepository.getById(id, tok());
    if (!ok) throw new Error(error || "Product not found");
    return new Product(data);
  }

  return { getAllProducts, getProductById };
}
