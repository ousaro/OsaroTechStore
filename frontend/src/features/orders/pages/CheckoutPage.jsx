import { useState, useMemo } from "react";
import { useUsers } from "../../users/hooks/useUsers.js";
import { useCart } from "../../cart/hooks/useCart.js";
import { useProducts } from "../../products/hooks/useProducts.js";
import { ProductImage } from "../../../components/ui/ProductImage.jsx";
import { getErrorMessage } from "../../../lib/errorUtils.js";
import { FiMapPin, FiShield, FiTruck } from "react-icons/fi";

export function CheckoutPage({ ordersInputPort, paymentsInputPort }) {
  const { profile } = useUsers();
  const { cart } = useCart();
  const { products } = useProducts();

  const [address, setAddress] = useState({
    street: profile?.address || "", city: profile?.city || "",
    state: profile?.state || "", postalCode: String(profile?.postalCode||""), country: profile?.country || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cartItems = useMemo(() =>
    cart.lines.map((line) => {
      const p = products.find((pr) => pr.id === line.productId);
      return p ? { ...p, quantity: line.quantity } : null;
    }).filter(Boolean),
    [cart.lines, products]
  );

  const total = cartItems.reduce((s, i) => s + i.price.amount * i.quantity, 0);
  const setA = (k) => (e) => setAddress((a) => ({ ...a, [k]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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
      setError(getErrorMessage(err, "Could not start checkout. Please review your order and try again."));
    } finally { setLoading(false); }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="section-kicker">Checkout</div>
          <h1 className="page-title">Review and pay</h1>
          <p className="page-subtitle">Delivery details, item summary, and protected payment in one clear step.</p>
        </div>
      </div>
      <div className="checkout-banner">
        <div className="checkout-banner-item"><FiTruck size={18} /> Fast dispatch on in-stock items</div>
        <div className="checkout-banner-item"><FiMapPin size={18} /> Ship to your saved address or update it here</div>
        <div className="checkout-banner-item"><FiShield size={18} /> Stripe-secured checkout session</div>
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={placeOrder} className="flex flex-col gap-4">
          <div className="card p-5 sm:p-6">
            <h2 className="mb-5 text-[17px] font-bold">Delivery address</h2>
            <div className="flex flex-col gap-3.5">
              <div className="field"><label>Street address</label><input className="input" placeholder="123 Main Street" value={address.street} onChange={setA("street")} required /></div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="field"><label>City</label><input className="input" placeholder="Casablanca" value={address.city} onChange={setA("city")} required /></div>
                <div className="field"><label>State / Region</label><input className="input" placeholder="Region" value={address.state} onChange={setA("state")} /></div>
              </div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="field"><label>Postal code</label><input className="input" placeholder="20000" value={address.postalCode} onChange={setA("postalCode")} /></div>
                <div className="field"><label>Country</label><input className="input" placeholder="Morocco" value={address.country} onChange={setA("country")} required /></div>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || cartItems.length === 0}>
            {loading ? "Processing…" : `Pay USD ${total.toFixed(2)} →`}
          </button>
        </form>
        <div className="card checkout-summary">
          <h2 className="mb-4 text-base font-bold">Your order</h2>
          {cartItems.map((i) => (
            <div key={i.id} className="checkout-line">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-surface-2 text-lg">
                <ProductImage src={i.primaryImage} alt="" placeholderSize={22} imgClassName="h-full w-full object-contain p-1" />
              </div>
              <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold leading-snug">{i.name}</div><div className="text-xs text-ink-muted">Qty: {i.quantity}</div></div>
              <div className="ml-auto text-sm font-bold">{i.price.currency} {(i.price.amount*i.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div className="summary-row total mt-4"><span>Total</span><span>USD {total.toFixed(2)}</span></div>
          <p className="checkout-summary-note">You will be redirected to a secure payment page after placing the order.</p>
        </div>
      </div>
    </div>
  );
}
