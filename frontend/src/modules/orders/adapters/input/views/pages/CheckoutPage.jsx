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
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <h1 className="page-title mb-7">Checkout</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={placeOrder} className="flex flex-col gap-4">
          <div className="card p-6">
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
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? "Processing…" : `Pay USD ${total.toFixed(2)} →`}
          </button>
        </form>
        <div className="card p-5">
          <h2 className="mb-4 text-base font-bold">Your order</h2>
          {cartItems.map((i) => (
            <div key={i.id} className="flex items-center gap-3 border-b border-border py-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-surface-2 text-lg">
                {i.primaryImage ? <img src={i.primaryImage} className="h-full w-full object-contain p-1" alt="" /> : <FiSmartphone />}
              </div>
              <div className="flex-1"><div className="text-[13px] font-semibold">{i.name}</div><div className="text-xs text-ink-muted">Qty: {i.quantity}</div></div>
              <div className="text-sm font-bold">{i.price.currency} {(i.price.amount*i.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div className="summary-row total mt-4"><span>Total</span><span>USD {total.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
