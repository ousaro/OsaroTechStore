import { createContext, useContext, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";

export const ProductsViewContext = createContext(null);

export function createProductsViewAdapter({ productsInputPort, productReadModel }) {
  const { useProductReadModel } = productReadModel;

  function ProductsProvider({ children }) {
    const { user } = useAuth();
    const { products, setProducts, loaded, setLoaded, loading, setLoading, error, setError } = useProductReadModel();

    useEffect(() => {
      if (!user || loaded) return;
      let cancelled = false;

      setLoading(true);
      setError(null);
      productsInputPort.getAllProducts()
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
    }, [user?.id, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

    const value = {
      products,
      loaded,
      loading,
      error,
      createProduct:  productsInputPort.createProduct,
      updateProduct:  productsInputPort.updateProduct,
      uploadProductImage: productsInputPort.uploadProductImage,
      deleteProduct:  productsInputPort.deleteProduct,
      addProductReview: productsInputPort.addProductReview,
      getProductById: productsInputPort.getProductById,
    };

    return (
      <ProductsViewContext.Provider value={value}>
        {children}
      </ProductsViewContext.Provider>
    );
  }

  return { ProductsProvider };
}

export function useProducts() {
  const ctx = useContext(ProductsViewContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
