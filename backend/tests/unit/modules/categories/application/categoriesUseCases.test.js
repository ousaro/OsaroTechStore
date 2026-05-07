import test from "node:test";
import assert from "node:assert/strict";

import { buildAddCategoryUseCase } from "../../../../../src/modules/categories/application/commands/addCategoryUseCase.js";
import { buildDeleteCategoryUseCase } from "../../../../../src/modules/categories/application/commands/deleteCategoryUseCase.js";
import { CategoryNotFoundError } from "../../../../../src/modules/categories/application/errors/CategoryApplicationError.js";

const createPublisher = () => {
  const events = [];
  return {
    events,
    publish: async (event) => events.push(event),
  };
};

const createLogger = () => {
  const entries = [];
  return {
    entries,
    info: (entry) => entries.push(entry),
  };
};

test("addCategory persists, publishes CategoryCreated, logs, and returns read model", async () => {
  const publisher = createPublisher();
  const logger = createLogger();
  const categoryRepository = {
    create: async (record) => ({ ...record, _id: "c1" }),
  };
  const addCategory = buildAddCategoryUseCase({
    categoryRepository,
    categoryEventPublisher: publisher,
    logger,
  });

  const result = await addCategory({ name: "Accessories" });

  assert.equal(result._id, "c1");
  assert.equal(publisher.events[0].type, "CategoryCreated");
  assert.deepEqual(publisher.events[0].payload, {
    categoryId: "c1",
    categoryName: "Accessories",
  });
  assert.deepEqual(logger.entries[0], { msg: "Category created", categoryId: "c1" });
});

test("deleteCategory deletes, publishes CategoryDeleted, and returns read model", async () => {
  const publisher = createPublisher();
  const deleteCategory = buildDeleteCategoryUseCase({
    categoryRepository: {
      deleteById: async (id) => ({ _id: id, name: "Accessories" }),
    },
    categoryEventPublisher: publisher,
    logger: createLogger(),
  });

  const result = await deleteCategory({ id: "c1" });

  assert.equal(result._id, "c1");
  assert.equal(publisher.events[0].type, "CategoryDeleted");
  assert.deepEqual(publisher.events[0].payload, {
    categoryId: "c1",
    categoryName: "Accessories",
  });
});

test("deleteCategory throws CategoryNotFoundError when missing", async () => {
  const deleteCategory = buildDeleteCategoryUseCase({
    categoryRepository: { deleteById: async () => null },
    categoryEventPublisher: createPublisher(),
    logger: createLogger(),
  });

  await assert.rejects(() => deleteCategory({ id: "missing" }), CategoryNotFoundError);
});
