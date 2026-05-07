import test from "node:test";
import assert from "node:assert/strict";

import { buildAddProductUseCase } from "../../../../../src/modules/products/application/commands/addProductUseCase.js";
import { buildGetProductByIdUseCase } from "../../../../../src/modules/products/application/queries/getProductByIdUseCase.js";
import { ProductNotFoundError } from "../../../../../src/modules/products/application/errors/ProductApplicationError.js";

const createLogger = () => {
  const entries = [];
  return {
    entries,
    info: (entry) => entries.push(entry),
  };
};

test("addProduct validates, persists, logs, and returns read model", async () => {
  const createdRecords = [];
  const productRepository = {
    create: async (record) => {
      createdRecords.push(record);
      return { ...record, _id: "p1", createdAt: "created" };
    },
  };
  const logger = createLogger();
  const addProduct = buildAddProductUseCase({ productRepository, logger });

  const result = await addProduct({
    name: "Keyboard",
    price: 49.99,
    category: "accessories",
    stock: 3,
  });

  assert.equal(createdRecords[0].name, "Keyboard");
  assert.equal(createdRecords[0].status, "new");
  assert.equal(result._id, "p1");
  assert.equal(result.category, "accessories");
  assert.deepEqual(logger.entries[0], { msg: "Product added", productId: "p1" });
});

test("getProductById returns read model when product exists", async () => {
  const getProductById = buildGetProductByIdUseCase({
    productRepository: {
      findById: async (id) => ({
        _id: id,
        name: "Keyboard",
        price: 49.99,
        currency: "USD",
        category: "accessories",
      }),
    },
  });

  const result = await getProductById({ id: "p1" });

  assert.equal(result._id, "p1");
  assert.equal(result.name, "Keyboard");
});

test("getProductById throws ProductNotFoundError when missing", async () => {
  const getProductById = buildGetProductByIdUseCase({
    productRepository: { findById: async () => null },
  });

  await assert.rejects(
    () => getProductById({ id: "missing" }),
    ProductNotFoundError
  );
});
