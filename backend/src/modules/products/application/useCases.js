/**
 * Products Application Use Cases.
 *
 * Fixed from original:
 *  - productService singleton removed — was a no-op bug in composition.js.
 *  - removeProductsByCategory exposed as collaboration method (for CategoryDeleted event).
 *  - Scheduler is created here as a use case, not as a composition side-effect.
 */
import { createProduct, PRODUCT_STATUSES } from "../../domain/entities/Product.js";
import { ProductNotFoundError }            from "../errors/ProductApplicationError.js";
import { assertNonEmptyString }            from "../../../../shared/kernel/assertions/index.js";

// ── Read model ────────────────────────────────────────────────────────────────
export const toProductReadModel = (record) => {
  if (!record) return null;
  return {
    _id:         record._id?.toString(),
    name:        record.name,
    description: record.description,
    price:       record.price,
    currency:    record.currency,
    category:    record.category?.toString(),
    stock:       record.stock,
    images:      record.images,
    status:      record.status,
    createdAt:   record.createdAt,
    updatedAt:   record.updatedAt,
  };
};

// ── Commands ──────────────────────────────────────────────────────────────────
export const buildAddProductUseCase = ({ productRepository, logger }) =>
  async (data) => {
    const product = createProduct(data);
    const saved   = await productRepository.create(product.toPrimitives());
    logger?.info({ msg: "Product added", productId: saved._id });
    return toProductReadModel(saved);
  };

export const buildUpdateProductUseCase = ({ productRepository }) =>
  async ({ id, updates }) => {
    assertNonEmptyString(id, "id");
    const saved = await productRepository.updateById(id, updates);
    if (!saved) throw new ProductNotFoundError(`Product ${id} not found`);
    return toProductReadModel(saved);
  };

export const buildDeleteProductUseCase = ({ productRepository }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");
    const saved = await productRepository.deleteById(id);
    if (!saved) throw new ProductNotFoundError(`Product ${id} not found`);
    return toProductReadModel(saved);
  };

export const buildRemoveProductsByCategoryUseCase = ({ productRepository, logger }) =>
  async ({ categoryId }) => {
    assertNonEmptyString(categoryId, "categoryId");
    const count = await productRepository.deleteByCategoryId(categoryId);
    logger?.info({ msg: "Products removed by category", categoryId, count });
    return { deleted: count };
  };

// ── Queries ───────────────────────────────────────────────────────────────────
export const buildGetAllProductsUseCase = ({ productRepository }) =>
  async ({ category, status } = {}) => {
    const records = await productRepository.findAll({ category, status });
    return records.map(toProductReadModel);
  };

export const buildGetProductByIdUseCase = ({ productRepository }) =>
  async ({ id }) => {
    assertNonEmptyString(id, "id");
    const record = await productRepository.findById(id);
    if (!record) throw new ProductNotFoundError(`Product ${id} not found`);
    return toProductReadModel(record);
  };

// ── Scheduler use case ────────────────────────────────────────────────────────
// Transitions products from "new" → "active" after 24h.
// Fixed: was a side-effect in composition.js (productService singleton bug).
export const buildNewProductStatusScheduler = ({ productRepository, logger }) => ({
  name: "newProductStatusScheduler",
  start() {
    const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
    const run = async () => {
      try {
        const cutoff = new Date(Date.now() - INTERVAL_MS);
        const count  = await productRepository.updateStatusBefore({
          fromStatus: PRODUCT_STATUSES.NEW,
          toStatus:   PRODUCT_STATUSES.ACTIVE,
          before:     cutoff,
        });
        if (count > 0) {
          logger?.info({ msg: "Scheduler: new→active products updated", count });
        }
      } catch (err) {
        logger?.error({ msg: "Scheduler: failed to update product statuses", error: err.message });
      }
    };
    run();
    return setInterval(run, INTERVAL_MS);
  },
});
