import { useMemo } from "react";
import { useCart } from "../hooks/useCart.js";
import { useProducts } from "../../products/hooks/useProducts.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { Link } from "../../../components/ui/Link.jsx";
import { QtyControl } from "../../../components/ui/QtyControl.jsx";
import { ProductImage } from "../../../components/ui/ProductImage.jsx";
import { FiArrowRight, FiShoppingBag, FiTrash2 } from "react-icons/fi";

export function CartPage() {
  const { cart, removeFromCart, setQuantity } = useCart();
  const { products } = useProducts();
  const { navigate } = useNavigate();

  const cartItems = useMemo(() =>
    cart.lines.map((line) => {
      const p = products.find((pr) => pr.id === line.productId);
      return p ? { ...p, quantity: line.quantity } : null;
    }).filter(Boolean),
    [cart.lines, products]
  );

  const total = cartItems.reduce((s, i) => s + i.price.amount * i.quantity, 0);
  const currency = cartItems[0]?.price.currency || "USD";

  if (cart.isEmpty) return (
    <div className="page-shell">
      <div className="empty-state pt-20">
        <span className="icon"><FiShoppingBag size={30} /></span><h3>Your cart is empty</h3><p>Browse products and add items to get started.</p>
        <button className="btn btn-primary mt-5" onClick={() => navigate("/products")}>Shop now <FiArrowRight /></button>
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      <h1 className="page-title mb-7">Shopping cart</h1>
      <div className="cart-layout">
        <div className="card px-4 sm:px-6">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-media">
                <ProductImage src={item.primaryImage} alt={item.name} placeholderSize={30} imgClassName="cart-item-img" />
              </div>
              <div className="cart-item-main">
                <Link to={`/product/${item.id}`} className="cart-item-title">{item.name}</Link>
                <div className="text-[13px] text-ink-muted">{item.price.currency} {item.price.amount.toFixed(2)} each</div>
                <QtyControl value={item.quantity} max={item.stock} onDecrement={() => setQuantity(item.id, item.quantity-1)} onIncrement={() => setQuantity(item.id, item.quantity+1)} />
              </div>
              <div className="cart-item-total">
                <div className="text-base font-extrabold">{item.price.currency} {(item.price.amount * item.quantity).toFixed(2)}</div>
                <button className="btn btn-sm bg-transparent text-accent sm:mt-2" onClick={() => removeFromCart(item.id)}><FiTrash2 /> Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="card order-summary">
          <h2 className="mb-5 text-lg font-bold">Order summary</h2>
          {cartItems.map((i) => (
            <div key={i.id} className="summary-row">
              <span className="min-w-0 max-w-[14rem] overflow-hidden text-ellipsis whitespace-nowrap">{i.name} ×{i.quantity}</span>
              <span>{i.price.currency} {(i.price.amount * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row total"><span>Total</span><span>{currency} {total.toFixed(2)}</span></div>
          <button className="btn btn-primary btn-lg mt-5 w-full" onClick={() => navigate("/checkout")}>Proceed to checkout <FiArrowRight /></button>
          <button className="btn btn-ghost mt-2 w-full" onClick={() => navigate("/products")}>Continue shopping</button>
        </div>
      </div>
    </div>
  );
}
