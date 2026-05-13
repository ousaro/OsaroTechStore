import { Category } from "./domain/entities/Category.js";
import { CategoryEvents } from "./domain/events/CategoryEvents.js";
import { assertInputPort } from "../../shared/kernel/assertions/portAssertions.js";

export function createCategoriesModule({ categories: repo, sessionStore, eventBus, notify }) {
  const tok = () => sessionStore.get()?.token;

  async function getAllCategories() {
    const { ok, data } = await repo.getAll(tok());
    return ok ? data.map((r) => new Category(r)) : [];
  }

  async function createCategory(payload) {
    const { ok, data, error } = await repo.create(payload, tok());
    if (!ok) { notify.error(error || "Failed"); throw new Error(error); }
    const category = new Category(data);
    eventBus.publish(CategoryEvents.created(category));
    notify.success("Category created!");
    return category;
  }

  async function updateCategory(id, payload) {
    const { ok, data, error } = await repo.update(id, payload, tok());
    if (!ok) { notify.error(error || "Failed"); throw new Error(error); }
    const category = new Category(data);
    eventBus.publish(CategoryEvents.updated(category));
    notify.success("Category updated!");
    return category;
  }

  async function deleteCategory(id, categoryName) {
    const { ok, error } = await repo.delete(id, tok());
    if (!ok) { notify.error(error || "Failed"); throw new Error(error); }
    eventBus.publish(CategoryEvents.deleted(id, categoryName));
    notify.success("Category deleted");
  }

  const inputPort = { getAllCategories, createCategory, updateCategory, deleteCategory };
  assertInputPort("CategoriesInputPort", inputPort, ["getAllCategories","createCategory","updateCategory","deleteCategory"]);
  return inputPort;
}
