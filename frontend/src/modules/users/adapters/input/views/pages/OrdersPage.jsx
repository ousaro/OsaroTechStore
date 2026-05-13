import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../../auth/adapters/input/views/useAuthModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { ProfileSidebar } from "../ProfileSidebar.jsx";
import { Badge } from "../../../../../../shared/infrastructure/ui/Badge.jsx";
import { Money } from "../../../../../../shared/domain/value-objects/Money.js";
import { FiArchive } from "react-icons/fi";

export function OrdersPage({ ordersInputPort }) {
  const { user } = useAuth();
  const { path } = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    ordersInputPort.getAllOrders().then(setOrders);
  }, [user?.id]); // eslint-disable-line

  const myOrders = useMemo(() =>
    user?.isAdmin ? orders : orders.filter((o) => o.ownerId === user?.id),
    [orders, user]
  );

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" }) : "—";

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header"><div><h1 className="page-title">Order history</h1><p className="page-subtitle">{myOrders.length} orders</p></div></div>
        {myOrders.length === 0
          ? <div className="empty-state"><span className="icon"><FiArchive size={30} /></span><h3>No orders yet</h3><p>Your orders will appear here.</p></div>
          : (
            <div className="card table-wrap">
              <table>
                <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead>
                <tbody>
                  {myOrders.map((o) => (
                    <tr key={o.id}>
                      <td><code className="text-xs">#{o.id?.slice(-8)}</code></td>
                      <td className="text-[13px] text-ink-muted">{fmt(o.createdAt)}</td>
                      <td>{o.orderLines?.length ?? 0} items</td>
                      <td className="font-bold">{Money.fromRaw(o.totalPrice).format()}</td>
                      <td><Badge status={o.orderStatus} /></td>
                      <td><Badge status={o.paymentStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}
