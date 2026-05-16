import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { Cart } from "../model/Cart.js";
import { Events } from "../../../lib/events.js";

export const CartViewContext = createContext(null);

export function createCartViewAdapter({ cartInputPort, eventBus }) {
  function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState(new Cart());

    useEffect(() => {
      if (!user) { setCart(new Cart()); return; }
      const raw = JSON.parse(localStorage.getItem("ots_session") || "{}");
      setCart(Cart.fromRaw(raw.cart || []));
    }, [user?.id]); // eslint-disable-line

    useEffect(() => {
      const onUpdated = (e) => setCart(e.payload.cart);
      eventBus.subscribe(Events.CART_UPDATED, onUpdated);
      return () => eventBus.unsubscribe(Events.CART_UPDATED, onUpdated);
    }, []);

    const value = {
      cart,
      addToCart: (productId, qty) => cartInputPort.addToCart(productId, qty),
      removeFromCart: (productId) => cartInputPort.removeFromCart(productId),
      setQuantity: (productId, qty) => cartInputPort.setQuantity(productId, qty),
      clearCart: () => cartInputPort.clearCart(),
    };

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
