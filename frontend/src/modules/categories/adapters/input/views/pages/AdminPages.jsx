import { useState, useEffect } from "react";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { useAuth } from "../../../../../auth/adapters/input/views/useAuthModule.js";
import { ProfileSidebar } from "../../../../../users/adapters/input/views/ProfileSidebar.jsx";
import { Avatar } from "../../../../../../shared/infrastructure/ui/Avatar.jsx";
import { Badge } from "../../../../../../shared/infrastructure/ui/Badge.jsx";
import { Money } from "../../../../../../shared/domain/value-objects/Money.js";
import {
  FiArchive,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiHeadphones,
  FiMapPin,
  FiMail,
  FiPhone,
  FiShield,
  FiTag,
  FiTrash2,
  FiTruck,
  FiX,
  FiZap,
} from "react-icons/fi";

/* ── DashboardPage ─────────────────────────────────────────────── */
export function DashboardPage({ ordersInputPort, productsInputPort }) {
  const [orders, setOrders]     = useState([]);
  const [products, setProducts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    ordersInputPort.getAllOrders().then(setOrders);
    productsInputPort.getAllProducts().then(setProducts);
  }, [user?.id]); // eslint-disable-line

  const revenue = orders.reduce((s, o) => s + (o.totalPrice?.amount || 0), 0);
  const byStatus = orders.reduce((m, o) => { m[o.orderStatus] = (m[o.orderStatus]||0)+1; return m; }, {});

  return (
    <div className="page-shell">
      <div className="page-header"><div><h1 className="page-title">Dashboard</h1><p className="page-subtitle">Store overview</p></div></div>
      <div className="stats-grid">
        {[
          [FiZap, "Revenue", "$"+revenue.toFixed(0), true],
          [FiArchive, "Orders", orders.length],
          [FiCheckCircle, "Paid", orders.filter(o=>o.paymentStatus==="paid").length],
          [FiClock, "Pending", orders.filter(o=>o.orderStatus==="pending").length],
          [FiTag, "Products", products.length],
        ].map(([Icon,label,value,accent])=>(
          <div key={label} className="card stat-card"><div className="stat-label flex items-center gap-2"><Icon size={14} /> {label}</div><div className={`stat-value ${accent?"accent":""}`}>{value}</div></div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-base font-bold">Orders by status</h2>
          {Object.entries(byStatus).map(([s,c]) => (
            <div key={s} className="flex items-center justify-between border-b border-border py-[9px]"><Badge status={s} /><span className="font-bold">{c}</span></div>
          ))}
        </div>
        <div className="card p-6">
          <h2 className="mb-4 text-base font-bold">Recent orders</h2>
          {orders.slice(0,6).map((o) => (
            <div key={o.id} className="flex items-center justify-between border-b border-border py-[9px]">
              <div><code className="text-xs">#{o.id?.slice(-8)}</code><div className="text-xs text-ink-muted">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</div></div>
              <div className="text-right"><div className="text-[13px] font-bold">{Money.fromRaw(o.totalPrice).format()}</div><Badge status={o.orderStatus} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── ManageUsersPage ───────────────────────────────────────────── */
export function ManageUsersPage({ authInputPort }) {
  const { user } = useAuth();
  const { path } = useNavigate();
  const [users, setUsers]       = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => { if (user?.isAdmin) authInputPort.listUsers().then(({ data }) => { if (data) setUsers(data.map(u => ({ ...u, id: u._id, fullName: `${u.firstName||""} ${u.lastName||""}`.trim() })))}); }, [user?.id]); // eslint-disable-line

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setLoadingId(id);
    await authInputPort.deleteUser(id);
    setUsers((us) => us.filter((u) => u.id !== id));
    setLoadingId(null);
  };

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header"><div><h1 className="page-title">Manage users</h1><p className="page-subtitle">{users.length} users</p></div></div>
        <div className="card table-wrap">
          <table>
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id||u._id}>
                  <td><div className="flex items-center gap-2.5"><Avatar src={u.picture} name={u.fullName} firstName={u.firstName} lastName={u.lastName} alt={u.fullName || "User"} className="table-avatar" /><span className="font-semibold">{u.fullName}</span></div></td>
                  <td className="text-[13px] text-ink-muted">{u.email}</td>
                  <td>{u.admin ? <span className="admin-tag">Admin</span> : <span className="text-[13px] text-ink-muted">Customer</span>}</td>
                  <td className="text-[13px] text-ink-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id||u._id)} disabled={loadingId===(u.id||u._id)||(u.id||u._id)===user?.id} aria-label="Delete user">{loadingId===(u.id||u._id) ? "…" : <FiTrash2 />}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── CategoriesPage ────────────────────────────────────────────── */
export function CategoriesPage({ categoriesInputPort, onCategoriesChange }) {
  const { path } = useNavigate();
  const [cats, setCats]       = useState([]);
  const [form, setForm]       = useState({ name:"", description:"" });
  const [creating, setCreating] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [editId, setEditId]   = useState(null);
  const [editForm, setEditForm] = useState({ name:"", description:"" });
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    categoriesInputPort.getAllCategories().then((data) => {
      setCats(data);
      onCategoriesChange?.(data);
    });
  }, []); // eslint-disable-line

  const create = async (e) => {
    e.preventDefault(); if (!form.name.trim()) return;
    setCreating(true);
    try {
      const c = await categoriesInputPort.createCategory(form);
      setCats((cs) => {
        const next = [c, ...cs];
        onCategoriesChange?.(next);
        return next;
      });
      setForm({ name:"", description:"" });
    }
    finally { setCreating(false); }
  };

  const startEdit = (c) => {
    setEditId(c.id);
    setEditForm({ name: c.name, description: c.description });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name:"", description:"" });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      const updated = await categoriesInputPort.updateCategory(editId, editForm);
      setCats((cs) => {
        const next = cs.map((x) => (x.id === editId ? updated : x));
        onCategoriesChange?.(next);
        return next;
      });
      cancelEdit();
    }
    finally { setSaving(false); }
  };

  const del = async (c) => {
    if (!window.confirm("Delete this category?")) return;
    setLoadingId(c.id);
    try {
      await categoriesInputPort.deleteCategory(c.id, c.name);
      setCats((cs) => {
        const next = cs.filter((x) => x.id !== c.id);
        onCategoriesChange?.(next);
        return next;
      });
    }
    finally { setLoadingId(null); }
  };

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header"><div><h1 className="page-title">Categories</h1><p className="page-subtitle">{cats.length} categories</p></div></div>
        <div className="card mb-5 p-6">
          <h2 className="mb-4 text-base font-bold">Add new category</h2>
          <form onSubmit={create} className="flex flex-wrap items-end gap-3">
            <div className="field flex-[1_1_160px]"><label>Name *</label><input className="input" placeholder="e.g. Smartphones" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name:e.target.value }))} required /></div>
            <div className="field flex-[2_1_240px]"><label>Description</label><input className="input" placeholder="Optional" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description:e.target.value }))} /></div>
            <button type="submit" className="btn btn-primary" disabled={creating}>+ {creating ? "Creating…" : "Create"}</button>
          </form>
        </div>
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Description</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {cats.map((c) => (
                editId === c.id ? (
                  <tr key={c.id}>
                    <td><input className="input w-full" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} required autoFocus /></td>
                    <td><input className="input w-full" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} /></td>
                    <td className="text-[13px] text-ink-muted">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                    <td><div className="flex gap-1.5"><button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : <FiCheckCircle />}</button><button className="btn btn-ghost btn-sm" onClick={cancelEdit} disabled={saving}><FiX /></button></div></td>
                  </tr>
                ) : (
                  <tr key={c.id}>
                    <td className="font-semibold">{c.name}</td>
                    <td className="text-[13px] text-ink-muted">{c.description||"—"}</td>
                    <td className="text-[13px] text-ink-muted">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                    <td><div className="flex gap-1.5"><button className="btn btn-ghost btn-sm" onClick={() => startEdit(c)} aria-label="Edit category"><FiEdit2 /></button><button className="btn btn-danger btn-sm" onClick={() => del(c)} disabled={loadingId===c.id} aria-label="Delete category">{loadingId===c.id?"…":<FiTrash2 />}</button></div></td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── AboutPage ─────────────────────────────────────────────────── */
export function AboutPage() {
  const values = [
    { icon: FiTruck, title: "Fast local delivery", sub: "Clear fulfillment from cart to doorstep." },
    { icon: FiShield, title: "Secure checkout", sub: "Stripe-powered payments and careful account handling." },
    { icon: FiHeadphones, title: "Human support", sub: "Help with orders, products, and setup questions." },
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <div>
          <div className="section-kicker">About the store</div>
          <h1 className="about-title"><span className="accent">Osaro</span>Tech Store</h1>
          <p className="about-lede">A focused tech shop for phones, accessories, and everyday devices, built around clear product discovery, reliable checkout, and customer support that feels close to home.</p>
          <div className="about-actions">
            <a className="btn btn-primary btn-lg" href="#/products">Explore products</a>
            <a className="btn btn-ghost btn-lg" href="mailto:hello@osarotech.store">Contact support</a>
          </div>
        </div>
        <div className="about-signal-card">
          <span className="icon-pill"><FiZap size={22} /></span>
          <div>
            <div className="about-signal-value">2024</div>
            <div className="about-signal-label">Founded with a practical love for useful technology</div>
          </div>
        </div>
      </section>

      <section className="about-grid">
        {values.map(({ icon: Icon, title, sub })=>(
          <div key={title} className="card about-value-card">
            <span className="icon-pill"><Icon size={22} /></span>
            <div className="mb-1 font-extrabold">{title}</div>
            <div className="text-sm text-ink-muted">{sub}</div>
          </div>
        ))}
      </section>

      <section className="card about-story">
        <div>
          <div className="section-kicker">What we care about</div>
          <h2>Simple choices, solid gear, no noise.</h2>
        </div>
        <p>OsaroTech exists for shoppers who want the right device without digging through clutter. The catalog is kept direct, product pages put the useful details first, and the checkout flow is designed to stay calm even when you are moving quickly.</p>
        <p>We focus on practical technology: the phone you use every day, the accessory that saves your battery, the device that makes work or study smoother. The goal is a store that feels polished, trustworthy, and easy to return to.</p>
      </section>

      <section className="card about-contact">
        <div>
          <div className="section-kicker">Contact</div>
          <h2>Need help choosing or ordering?</h2>
          <p>Reach out and we will help with product questions, delivery details, or account support.</p>
        </div>
        <div className="about-contact-list">
          <a href="tel:+65412785285"><FiPhone /> +65 412 785 285</a>
          <a href="mailto:hello@osarotech.store"><FiMail /> hello@osarotech.store</a>
          <span><FiMapPin /> 1554 Hay Mohamadi, Casablanca, Morocco</span>
        </div>
      </section>
    </div>
  );
}
