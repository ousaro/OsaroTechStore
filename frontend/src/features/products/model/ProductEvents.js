import { DomainEvent, Events } from "../../../lib/events.js";

export const ProductEvents = {
  created: (product) => new DomainEvent(Events.PRODUCT_CREATED, { product }),
  updated: (product) => new DomainEvent(Events.PRODUCT_UPDATED, { product }),
  deleted: (id) => new DomainEvent(Events.PRODUCT_DELETED, { id }),
};
