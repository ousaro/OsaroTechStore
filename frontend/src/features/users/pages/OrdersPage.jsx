import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { ProfileSidebar } from "../components/ProfileSidebar.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Select } from "../../../components/ui/Select.jsx";
import { Money } from "../../../lib/Money.js";
import { FiArchive, FiMapPin, FiSave, FiTrash2 } from "react-icons/fi";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../../orders/model/Order.js";

export function OrdersPage({ ordersInputPort, adminView = false }) {
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

  const visibleOrders = useMemo(() =>
    adminView && user?.isAdmin ? orders : orders.filter((o) => o.ownerId === user?.id),
    [adminView, orders, user]
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
        <div className="page-header">
          <div>
            <h1 className="page-title">{adminView ? "Manage orders" : "Order history"}</h1>
            <p className="page-subtitle">{visibleOrders.length} orders{adminView ? " across customers" : ""}</p>
          </div>
        </div>
        {visibleOrders.length === 0
          ? <div className="empty-state"><span className="icon"><FiArchive size={30} /></span><h3>No orders yet</h3><p>{adminView ? "Customer orders will appear here." : "Your orders will appear here."}</p></div>
          : (
            <div className="orders-stack">
              {visibleOrders.map((o) => {
                const isExpanded = expandedId === o.id;
                const draft = drafts[o.id] || { orderStatus: o.orderStatus, paymentStatus: o.paymentStatus };

                return (
                  <section key={o.id} className="card order-card">
                    <button className="order-card-head" onClick={() => setExpandedId(isExpanded ? null : o.id)}>
                      <div className="order-card-main">
                        <div className="order-card-id"><code>#{o.id?.slice(-8)}</code></div>
                        <div className="order-card-meta">
                          {fmt(o.createdAt)} • {o.orderLines?.length ?? 0} items
                          {adminView && o.ownerId ? ` • Customer ${o.ownerId.slice(-8)}` : ""}
                        </div>
                      </div>
                      <div className="order-card-side">
                        <div className="order-card-total">{Money.fromRaw(o.totalPrice).format()}</div>
                        <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
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
                              <div className="min-w-0">
                                <div className="order-line-name">{line.name}</div>
                                <div className="order-line-meta">Qty {line.quantity} • {line.unitPrice.format()}</div>
                              </div>
                              <div className="ml-auto order-line-total">{line.subtotal.format()}</div>
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
                                <Select value={draft.orderStatus} onChange={(e) => setDraft(o.id, "orderStatus", e.target.value)}>
                                  {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                </Select>
                              </label>
                              <label className="field">
                                <span className="order-tool-label">Payment</span>
                                <Select value={draft.paymentStatus} onChange={(e) => setDraft(o.id, "paymentStatus", e.target.value)}>
                                  {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                </Select>
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
