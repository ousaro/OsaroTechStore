import { useState, useMemo } from "react";
import { useAuth } from "../../../../../auth/adapters/input/views/useAuthModule.js";
import { useUsers } from "../../../../../users/adapters/input/views/useUsersModule.js";
import { useCart } from "../../../../../cart/adapters/input/views/useCartModule.js";
import { useProducts } from "../../../../../products/adapters/input/views/useProductsModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { FiSmartphone } from "react-icons/fi";

export function CheckoutPage({ ordersInputPort, paymentsInputPort }) {
  const { user } = useAuth();
  const { profile } = useUsers();
  const { cart } = useCart();
  const { products } = useProducts();
  const { navigate } = useNavigate();

  const [address, setAddress] = useState({
    street: profile?.address || "", city: profile?.city || "",
    state: profile?.state || "", postalCode: String(profile?.postalCode||""), country: profile?.country || "",
  });
  const [loading, setLoading] = useState(false);

  const cartItems = useMemo(() =>
    cart.lines.map((line) => {
      const p = products.find((pr) => pr.id === line._id);
      return p ? { ...p, quantity: line.quantity } : null;
    }).filter(Boolean),
    [cart.lines, products]
  );

  const total = cartItems.reduce((s, i) => s + i.price.amount * i.quantity, 0);
  const setA = (k) => (e) => setAddress((a) => ({ ...a, [k]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const order = await ordersInputPort.placeOrder({
        orderLines: cartItems.map((i) => ({ productId: i.id, name: i.name, price: i.price.amount, quantity: i.quantity })),
        deliveryAddress: address,
        currency: cartItems[0]?.price.currency || "USD",
      });
      const payment = await paymentsInputPort.initiatePayment({
        orderId: order.id,
        items: cartItems.map((i) => ({ name: i.name, price: i.price.amount, quantity: i.quantity })),
        currency: order.currency,
      });
      if (payment?.url) window.location.href = payment.url;
    } catch (err) {
      // errors already toasted by use cases
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>
      <h1 className="page-title" style={{ marginBottom:28 }}>Checkout</h1>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24, alignItems:"start" }}>
        <form onSubmit={placeOrder} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="card" style={{ padding:24 }}>
            <h2 style={{ fontSize:17, fontWeight:700, marginBottom:20 }}>Delivery address</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="field"><label>Street address</label><input className="input" placeholder="123 Main Street" value={address.street} onChange={setA("street")} required /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div className="field"><label>City</label><input className="input" placeholder="Casablanca" value={address.city} onChange={setA("city")} required /></div>
                <div className="field"><label>State / Region</label><input className="input" placeholder="Region" value={address.state} onChange={setA("state")} /></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div className="field"><label>Postal code</label><input className="input" placeholder="20000" value={address.postalCode} onChange={setA("postalCode")} /></div>
                <div className="field"><label>Country</label><input className="input" placeholder="Morocco" value={address.country} onChange={setA("country")} required /></div>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent:"center" }} disabled={loading}>
            {loading ? "Processing…" : `Pay USD ${total.toFixed(2)} →`}
          </button>
        </form>
        <div className="card" style={{ padding:20 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Your order</h2>
          {cartItems.map((i) => (
            <div key={i.id} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 0", borderBottom:"1px solid var(--border)" }}>
              <div style={{ width:48, height:48, background:"var(--surface-2)", borderRadius:"var(--radius-sm)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                {i.primaryImage ? <img src={i.primaryImage} style={{ width:"100%", height:"100%", objectFit:"contain", padding:4 }} alt="" /> : <FiSmartphone />}
              </div>
              <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:13 }}>{i.name}</div><div style={{ fontSize:12, color:"var(--ink-muted)" }}>Qty: {i.quantity}</div></div>
              <div style={{ fontWeight:700, fontSize:14 }}>{i.price.currency} {(i.price.amount*i.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div className="summary-row total" style={{ marginTop:16 }}><span>Total</span><span>USD {total.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
