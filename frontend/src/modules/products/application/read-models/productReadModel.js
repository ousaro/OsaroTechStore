/**
 * PRODUCTS — Read Model
 *
 * Reactive state for the product catalogue. Equivalent to backend read models
 * that keep a query-optimised view of the aggregate state.
 *
 * Listens to domain events to stay in sync — other modules never
 * reach into this module's state directly.
 */
import { useState, useEffect } from "react";
import { Events } from "../../../../shared/domain/events/DomainEvent.js";

export function createProductReadModel({ eventBus }) {
  /**
   * React hook that exposes the live product catalogue state.
   * Used by view adapters only.
   */
  function useProductReadModel(initialProducts = []) {
    const [products, setProducts] = useState(initialProducts);
    const [loaded, setLoaded]     = useState(false);

    useEffect(() => {
      const onCreated = (e) => setProducts((ps) => [e.payload.product, ...ps]);
      const onUpdated = (e) => setProducts((ps) => ps.map((p) => p.id === e.payload.product.id ? e.payload.product : p));
      const onDeleted = (e) => setProducts((ps) => ps.filter((p) => p.id !== e.payload.id));

      eventBus.subscribe(Events.PRODUCT_CREATED, onCreated);
      eventBus.subscribe(Events.PRODUCT_UPDATED, onUpdated);
      eventBus.subscribe(Events.PRODUCT_DELETED, onDeleted);

      return () => {
        eventBus.unsubscribe(Events.PRODUCT_CREATED, onCreated);
        eventBus.unsubscribe(Events.PRODUCT_UPDATED, onUpdated);
        eventBus.unsubscribe(Events.PRODUCT_DELETED, onDeleted);
      };
    }, []);

    return { products, setProducts, loaded, setLoaded };
  }

  return { useProductReadModel };
}
