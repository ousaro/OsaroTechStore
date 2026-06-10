import { createContext, useContext, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { eventBus } from "../../../store/eventBus.js";

export const ProductsViewContext = createContext(null);

const loadProducts = ({ productsInputPort, setProducts, setLoaded, setLoading, setError }) => {
  let cancelled = false;

  setLoading(true);
  setError(null);
  productsInputPort
    .getAllProducts()
    .then((data) => {
      if (cancelled) return;
      setProducts(data);
      setLoaded(true);
    })
    .catch((err) => {
      if (!cancelled) setError(err?.message || "Failed to load products");
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });

  return () => {
    cancelled = true;
  };
};

export function createProductsViewAdapter({ productsInputPort, productReadModel }) {
  const { useProductReadModel } = productReadModel;

  function ProductsProvider({ children }) {
    const { user } = useAuth();
    const { products, setProducts, loaded, setLoaded, loading, setLoading, error, setError } =
      useProductReadModel();

    const refresh = useCallback(() => {
      setLoaded(false);
    }, [setLoaded]);

    useEffect(() => {
      if (!user || loaded) return;
      return loadProducts({ productsInputPort, setProducts, setLoaded, setLoading, setError });
    }, [user?.id, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      const handler = () => refresh();
      eventBus.subscribe("products-changed", handler);
      return () => eventBus.unsubscribe("products-changed", handler);
    }, [refresh]);

    const value = {
      products,
      loaded,
      loading,
      error,
      refresh,
      createProduct: productsInputPort.createProduct,
      updateProduct: productsInputPort.updateProduct,
      uploadProductImage: productsInputPort.uploadProductImage,
      deleteProduct: productsInputPort.deleteProduct,
      addProductReview: productsInputPort.addProductReview,
      getProductById: productsInputPort.getProductById,
    };

    return <ProductsViewContext.Provider value={value}>{children}</ProductsViewContext.Provider>;
  }

  return { ProductsProvider };
}

export function useProducts() {
  const ctx = useContext(ProductsViewContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
