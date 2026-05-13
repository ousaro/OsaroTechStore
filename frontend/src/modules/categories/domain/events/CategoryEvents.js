import { DomainEvent, Events } from "../../../../shared/domain/events/DomainEvent.js";

export const CategoryEvents = {
  created: (category) => new DomainEvent(Events.CATEGORY_CREATED, { category }),
  deleted: (id, categoryName) => new DomainEvent(Events.CATEGORY_DELETED, { id, categoryName }),
};
