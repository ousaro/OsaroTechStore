import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../../auth/adapters/input/views/useAuthModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { ProfileSidebar } from "../ProfileSidebar.jsx";
import { Badge } from "../../../../../../shared/infrastructure/ui/Badge.jsx";
import { Money } from "../../../../../../shared/domain/value-objects/Money.js";
import { FiArchive, FiMapPin, FiSave, FiTrash2 } from "react-icons/fi";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../../../../../orders/domain/entities/Order.js";

export function OrdersPage({ ordersInputPort }) {
  const { user } = useAuth();
  const { path } = useNavigate();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    ordersInputPort.getAllOrders().then(setOrders);
  }, [user?.id]); // eslint-disable-line

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        orders.map((order) => [
          order.id,
          { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus },
        ])
      )
    );
  }, [orders]);

  const myOrders = useMemo(() =>
    user?.isAdmin ? orders : orders.filter((o) => o.ownerId === user?.id),
    [orders, user]
  );

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" }) : "—";
  const fmtAddress = (address) => [address.street, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(", ");

  const setDraft = (orderId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [orderId]: {
        ...(current[orderId] || {}),
        [field]: value,
      },
    }));
  };

  const saveOrder = async (orderId) => {
    const patch = drafts[orderId];
    if (!patch) return;
    setSavingId(orderId);
    try {
      const updated = await ordersInputPort.updateOrder(orderId, patch);
      setOrders((current) => current.map((order) => order.id === orderId ? updated : order));
    } finally {
      setSavingId(null);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    setDeletingId(orderId);
    try {
      await ordersInputPort.deleteOrder(orderId);
      setOrders((current) => current.filter((order) => order.id !== orderId));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header"><div><h1 className="page-title">Order history</h1><p className="page-subtitle">{myOrders.length} orders</p></div></div>
        {myOrders.length === 0
          ? <div className="empty-state"><span className="icon"><FiArchive size={30} /></span><h3>No orders yet</h3><p>Your orders will appear here.</p></div>
          : (
            <div className="orders-stack">
              {myOrders.map((o) => {
                const isExpanded = expandedId === o.id;
                const draft = drafts[o.id] || { orderStatus: o.orderStatus, paymentStatus: o.paymentStatus };

                return (
                  <section key={o.id} className="card order-card">
                    <button className="order-card-head" onClick={() => setExpandedId(isExpanded ? null : o.id)}>
                      <div className="order-card-main">
                        <div className="order-card-id"><code>#{o.id?.slice(-8)}</code></div>
                        <div className="order-card-meta">{fmt(o.createdAt)} • {o.orderLines?.length ?? 0} items</div>
                      </div>
                      <div className="order-card-side">
                        <div className="order-card-total">{Money.fromRaw(o.totalPrice).format()}</div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Badge status={o.orderStatus} />
                          <Badge status={o.paymentStatus} />
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="order-card-body">
                        <div className="order-lines">
                          {o.orderLines.map((line) => (
                            <div key={`${o.id}-${line.productId}-${line.name}`} className="order-line-item">
                              <div>
                                <div className="order-line-name">{line.name}</div>
                                <div className="order-line-meta">Qty {line.quantity} • {line.unitPrice.format()}</div>
                              </div>
                              <div className="order-line-total">{line.subtotal.format()}</div>
                            </div>
                          ))}
                        </div>
                        <div className="order-card-footer">
                          <div className="order-address">
                            <span><FiMapPin size={14} /> Delivery</span>
                            <p>{fmtAddress(o.deliveryAddress) || "No delivery address provided"}</p>
                          </div>
                          {user?.isAdmin ? (
                            <div className="order-admin-tools">
                              <label className="field">
                                <span className="order-tool-label">Order status</span>
                                <select className="input" value={draft.orderStatus} onChange={(e) => setDraft(o.id, "orderStatus", e.target.value)}>
                                  {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                              </label>
                              <label className="field">
                                <span className="order-tool-label">Payment</span>
                                <select className="input" value={draft.paymentStatus} onChange={(e) => setDraft(o.id, "paymentStatus", e.target.value)}>
                                  {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                              </label>
                              <div className="order-admin-actions">
                                <button className="btn btn-primary" onClick={() => saveOrder(o.id)} disabled={savingId === o.id}>
                                  <FiSave /> {savingId === o.id ? "Saving..." : "Save changes"}
                                </button>
                                <button className="btn btn-danger" onClick={() => deleteOrder(o.id)} disabled={deletingId === o.id}>
                                  <FiTrash2 /> {deletingId === o.id ? "Deleting..." : "Delete order"}
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )
        }
      </div>
    </div>
  );
}
