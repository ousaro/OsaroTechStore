import { useState, useEffect } from "react";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { useAuth } from "../../../../../auth/adapters/input/views/useAuthModule.js";
import { ProfileSidebar } from "../../../../../users/adapters/input/views/ProfileSidebar.jsx";
import { Badge } from "../../../../../../shared/infrastructure/ui/Badge.jsx";
import { Money } from "../../../../../../shared/domain/value-objects/Money.js";
import {
  FiArchive,
  FiCheckCircle,
  FiClock,
  FiHeadphones,
  FiMapPin,
  FiMail,
  FiPhone,
  FiShield,
  FiTag,
  FiTrash2,
  FiTruck,
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
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"40px 24px" }}>
      <div className="page-header"><div><h1 className="page-title">Dashboard</h1><p className="page-subtitle">Store overview</p></div></div>
      <div className="stats-grid">
        {[
          [FiZap, "Revenue", "$"+revenue.toFixed(0), true],
          [FiArchive, "Orders", orders.length],
          [FiCheckCircle, "Paid", orders.filter(o=>o.paymentStatus==="paid").length],
          [FiClock, "Pending", orders.filter(o=>o.orderStatus==="pending").length],
          [FiTag, "Products", products.length],
        ].map(([Icon,label,value,accent])=>(
          <div key={label} className="card stat-card"><div className="stat-label" style={{ display:"flex", alignItems:"center", gap:8 }}><Icon size={14} /> {label}</div><div className={`stat-value ${accent?"accent":""}`}>{value}</div></div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div className="card" style={{ padding:24 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Orders by status</h2>
          {Object.entries(byStatus).map(([s,c]) => (
            <div key={s} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid var(--border)" }}><Badge status={s} /><span style={{ fontWeight:700 }}>{c}</span></div>
          ))}
        </div>
        <div className="card" style={{ padding:24 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Recent orders</h2>
          {orders.slice(0,6).map((o) => (
            <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
              <div><code style={{ fontSize:12 }}>#{o.id?.slice(-8)}</code><div style={{ fontSize:12, color:"var(--ink-muted)" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</div></div>
              <div style={{ textAlign:"right" }}><div style={{ fontWeight:700, fontSize:13 }}>{Money.fromRaw(o.totalPrice).format()}</div><Badge status={o.orderStatus} /></div>
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
                  <td><div style={{ display:"flex", alignItems:"center", gap:10 }}><img src={u.picture||`https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName||"U")}&size=36&background=222632&color=f5f1e8`} alt="" style={{ width:36,height:36,borderRadius:"50%",objectFit:"cover" }} /><span style={{ fontWeight:600 }}>{u.fullName}</span></div></td>
                  <td style={{ color:"var(--ink-muted)", fontSize:13 }}>{u.email}</td>
                  <td>{u.admin ? <span className="admin-tag">Admin</span> : <span style={{ fontSize:13, color:"var(--ink-muted)" }}>Customer</span>}</td>
                  <td style={{ fontSize:13, color:"var(--ink-muted)" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
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
export function CategoriesPage({ categoriesInputPort }) {
  const { path } = useNavigate();
  const [cats, setCats]     = useState([]);
  const [form, setForm]     = useState({ name:"", description:"" });
  const [creating, setCreating] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => { categoriesInputPort.getAllCategories().then(setCats); }, []); // eslint-disable-line

  const create = async (e) => {
    e.preventDefault(); if (!form.name.trim()) return;
    setCreating(true);
    try { const c = await categoriesInputPort.createCategory(form); setCats((cs) => [c,...cs]); setForm({ name:"", description:"" }); }
    finally { setCreating(false); }
  };

  const del = async (c) => {
    if (!window.confirm("Delete this category?")) return;
    setLoadingId(c.id);
    try { await categoriesInputPort.deleteCategory(c.id, c.name); setCats((cs) => cs.filter((x) => x.id !== c.id)); }
    finally { setLoadingId(null); }
  };

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header"><div><h1 className="page-title">Categories</h1><p className="page-subtitle">{cats.length} categories</p></div></div>
        <div className="card" style={{ padding:24, marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Add new category</h2>
          <form onSubmit={create} style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
            <div className="field" style={{ flex:"1 1 160px" }}><label>Name *</label><input className="input" placeholder="e.g. Smartphones" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name:e.target.value }))} required /></div>
            <div className="field" style={{ flex:"2 1 240px" }}><label>Description</label><input className="input" placeholder="Optional" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description:e.target.value }))} /></div>
            <button type="submit" className="btn btn-primary" disabled={creating}>+ {creating ? "Creating…" : "Create"}</button>
          </form>
        </div>
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Description</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight:600 }}>{c.name}</td>
                  <td style={{ color:"var(--ink-muted)", fontSize:13 }}>{c.description||"—"}</td>
                  <td style={{ fontSize:13, color:"var(--ink-muted)" }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => del(c)} disabled={loadingId===c.id} aria-label="Delete category">{loadingId===c.id?"…":<FiTrash2 />}</button></td>
                </tr>
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
            <div style={{ fontWeight:800, marginBottom:4 }}>{title}</div>
            <div style={{ fontSize:14, color:"var(--ink-muted)" }}>{sub}</div>
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
