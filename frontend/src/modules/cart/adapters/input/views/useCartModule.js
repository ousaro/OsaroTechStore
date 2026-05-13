/**
 * CART — Input Adapter: React View Hook
 * Exposes cart state and operations to views.
 * Reacts to CART_UPDATED event so every part of the UI stays in sync.
 */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../../../auth/adapters/input/views/useAuthModule.js";
import { Cart } from "../../../domain/entities/Cart.js";
import { Events } from "../../../../../shared/domain/events/DomainEvent.js";

export const CartViewContext = createContext(null);

export function createCartViewAdapter({ cartInputPort, eventBus }) {
  function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState(new Cart());

    // Sync cart from session on login
    useEffect(() => {
      if (!user) { setCart(new Cart()); return; }
      // Cart lines live in the session (returned by every user mutation)
      const raw = JSON.parse(localStorage.getItem("ots_session") || "{}");
      setCart(Cart.fromRaw(raw.cart || []));
    }, [user?.id]); // eslint-disable-line

    // React to CART_UPDATED domain event
    useEffect(() => {
      const onUpdated = (e) => setCart(e.payload.cart);
      eventBus.subscribe(Events.CART_UPDATED, onUpdated);
      return () => eventBus.unsubscribe(Events.CART_UPDATED, onUpdated);
    }, []);

    const addToCart    = useCallback((productId, qty) => cartInputPort.addToCart(productId, qty),    []);
    const removeFromCart = useCallback((productId)   => cartInputPort.removeFromCart(productId),     []);
    const setQuantity  = useCallback((productId, qty) => cartInputPort.setQuantity(productId, qty),  []);
    const clearCart    = useCallback(()               => cartInputPort.clearCart(),                  []);

    const value = useMemo(() => ({ cart, addToCart, removeFromCart, setQuantity, clearCart }),
      [cart]);

    return (
      <CartViewContext.Provider value={value}>
        {children}
      </CartViewContext.Provider>
    );
  }

  return { CartProvider };
}

export function useCart() {
  const ctx = useContext(CartViewContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
