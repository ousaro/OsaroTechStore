/**
 * PRODUCTS — Input Adapter: React View Hook
 * Exposes the products module to React views via context.
 */
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../auth/adapters/input/views/useAuthModule.js";

export const ProductsViewContext = createContext(null);

export function createProductsViewAdapter({ productsInputPort, productReadModel }) {
  const { useProductReadModel } = productReadModel;

  function ProductsProvider({ children }) {
    const { user } = useAuth();
    const { products, setProducts, loaded, setLoaded } = useProductReadModel();

    // Load on auth
    useEffect(() => {
      if (!user || loaded) return;
      productsInputPort.getAllProducts().then((data) => {
        setProducts(data);
        setLoaded(true);
      });
    }, [user?.id]); // eslint-disable-line

    const value = useMemo(() => ({
      products,
      loaded,
      createProduct:  productsInputPort.createProduct,
      updateProduct:  productsInputPort.updateProduct,
      deleteProduct:  productsInputPort.deleteProduct,
      getProductById: productsInputPort.getProductById,
    }), [products, loaded]);

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
