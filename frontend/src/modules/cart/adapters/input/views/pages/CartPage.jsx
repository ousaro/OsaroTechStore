import { useMemo } from "react";
import { useCart } from "../useCartModule.js";
import { useProducts } from "../../../../../products/adapters/input/views/useProductsModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { Link } from "../../../../../../shared/infrastructure/ui/Link.jsx";
import { QtyControl } from "../../../../../../shared/infrastructure/ui/QtyControl.jsx";
import { FiArrowRight, FiShoppingBag, FiSmartphone, FiTrash2 } from "react-icons/fi";

export function CartPage() {
  const { cart, removeFromCart, setQuantity } = useCart();
  const { products } = useProducts();
  const { navigate } = useNavigate();

  const cartItems = useMemo(() =>
    cart.lines.map((line) => {
      const p = products.find((pr) => pr.id === line._id);
      return p ? { ...p, quantity: line.quantity } : null;
    }).filter(Boolean),
    [cart.lines, products]
  );

  const total = cartItems.reduce((s, i) => s + i.price.amount * i.quantity, 0);
  const currency = cartItems[0]?.price.currency || "USD";

  if (cart.isEmpty) return (
    <div className="page-shell">
      <div className="empty-state" style={{ paddingTop:80 }}>
        <span className="icon"><FiShoppingBag size={30} /></span><h3>Your cart is empty</h3><p>Browse products and add items to get started.</p>
        <button className="btn btn-primary" style={{ marginTop:20 }} onClick={() => navigate("/products")}>Shop now <FiArrowRight /></button>
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      <h1 className="page-title" style={{ marginBottom:28 }}>Shopping cart</h1>
      <div className="cart-layout">
        <div className="card" style={{ padding:"0 24px" }}>
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              {item.primaryImage
                ? <img src={item.primaryImage} className="cart-item-img" alt={item.name} />
                : <div className="cart-item-img" style={{ display:"flex", alignItems:"center", justifyContent:"center", color:"var(--ink-faint)" }}><FiSmartphone size={30} /></div>
              }
              <div style={{ flex:1 }}>
                <Link to={`/product/${item.id}`} style={{ fontWeight:600, fontSize:15, display:"block", marginBottom:4 }}>{item.name}</Link>
                <div style={{ fontSize:13, color:"var(--ink-muted)" }}>{item.price.currency} {item.price.amount.toFixed(2)} each</div>
                <QtyControl value={item.quantity} max={item.stock} onDecrement={() => setQuantity(item.id, item.quantity-1)} onIncrement={() => setQuantity(item.id, item.quantity+1)} />
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontWeight:800, fontSize:16 }}>{item.price.currency} {(item.price.amount * item.quantity).toFixed(2)}</div>
                <button className="btn btn-sm" style={{ color:"var(--accent)", marginTop:8, background:"none" }} onClick={() => removeFromCart(item.id)}><FiTrash2 /> Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="card order-summary">
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>Order summary</h2>
          {cartItems.map((i) => (
            <div key={i.id} className="summary-row">
              <span style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{i.name} ×{i.quantity}</span>
              <span>{i.price.currency} {(i.price.amount * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row total"><span>Total</span><span>{currency} {total.toFixed(2)}</span></div>
          <button className="btn btn-primary btn-lg" style={{ width:"100%", justifyContent:"center", marginTop:20 }} onClick={() => navigate("/checkout")}>Proceed to checkout <FiArrowRight /></button>
          <button className="btn btn-ghost" style={{ width:"100%", justifyContent:"center", marginTop:8 }} onClick={() => navigate("/products")}>Continue shopping</button>
        </div>
      </div>
    </div>
  );
}
