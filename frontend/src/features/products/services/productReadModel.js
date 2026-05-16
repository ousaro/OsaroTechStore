import { useState, useEffect } from "react";
import { Events } from "../../../lib/events.js";

export function createProductReadModel({ eventBus }) {
  function useProductReadModel(initialProducts = []) {
    const [products, setProducts] = useState(initialProducts);
    const [loaded, setLoaded]     = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState(null);

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

    return { products, setProducts, loaded, setLoaded, loading, setLoading, error, setError };
  }

  return { useProductReadModel };
}
