import { Product } from "../model/Product.js";
import { ProductEvents } from "../model/ProductEvents.js";

export function createProductCommands({ products: productRepository, sessionStore, eventBus, notify }) {
  const tok = () => sessionStore.get()?.token;

  async function createProduct(payload) {
    const { ok, data, error } = await productRepository.create(payload, tok());
    if (!ok) { notify.error(error || "Failed to create product"); throw new Error(error); }
    const product = new Product(data);
    eventBus.publish(ProductEvents.created(product));
    notify.success("Product created!");
    return product;
  }

  async function updateProduct(id, patch) {
    const { ok, data, error } = await productRepository.update(id, patch, tok());
    if (!ok) { notify.error(error || "Failed to update product"); throw new Error(error); }
    const product = new Product(data);
    eventBus.publish(ProductEvents.updated(product));
    notify.success("Product updated!");
    return product;
  }

  async function uploadProductImage(file) {
    const { ok, data, error } = await productRepository.uploadImage(file, tok());
    if (!ok) { notify.error(error || "Failed to upload image"); throw new Error(error); }
    return data.url;
  }

  async function deleteProduct(id) {
    const { ok, error } = await productRepository.delete(id, tok());
    if (!ok) { notify.error(error || "Failed to delete product"); throw new Error(error); }
    eventBus.publish(ProductEvents.deleted(id));
    notify.success("Product deleted");
  }

  async function addProductReview(id, payload) {
    const { ok, data, error } = await productRepository.addReview(id, payload, tok());
    if (!ok) { notify.error(error || "Failed to post comment"); throw new Error(error); }
    const product = new Product(data);
    eventBus.publish(ProductEvents.updated(product));
    notify.success("Comment posted");
    return product;
  }

  /** Called by the CategoryDeleted collaboration translator */
  async function removeProductsByCategory(categoryName) {
    eventBus.publish(ProductEvents.deleted(`category:${categoryName}`));
  }

  return { createProduct, updateProduct, uploadProductImage, deleteProduct, addProductReview, removeProductsByCategory };
}
