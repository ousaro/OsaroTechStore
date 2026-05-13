import { useState } from "react";
import { useProducts } from "../useProductsModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { Link } from "../../../../../../shared/infrastructure/ui/Link.jsx";
import { PRODUCT_STATUSES } from "../../../../domain/entities/Product.js";

export function AddProductPage({ editId, categories }) {
  const { products, createProduct, updateProduct } = useProducts();
  const { navigate } = useNavigate();
  const existing = editId ? products.find((p) => p.id === editId) : null;

  const [form, setForm] = useState({
    name:        existing?.name            || "",
    description: existing?.description    || "",
    price:       existing?.price.amount   || "",
    currency:    existing?.price.currency || "USD",
    category:    existing?.category       || "",
    stock:       existing?.stock          ?? 0,
    status:      existing?.status         || "new",
    images:      existing?.images         || [],
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      editId ? await updateProduct(editId, payload) : await createProduct(payload);
      navigate("/products");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px" }}>
      <div className="breadcrumb"><Link to="/products">Products</Link> / <span>{editId ? "Edit" : "Add product"}</span></div>
      <h1 className="page-title" style={{ marginBottom:28, marginTop:8 }}>{editId ? "Edit product" : "Add new product"}</h1>
      <form onSubmit={submit}>
        <div className="card" style={{ padding:28 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div className="field" style={{ gridColumn:"1 / -1" }}><label>Product name *</label><input className="input" value={form.name} onChange={set("name")} required placeholder="e.g. Samsung Galaxy S24" /></div>
            <div className="field" style={{ gridColumn:"1 / -1" }}><label>Description</label><textarea className="input" value={form.description} onChange={set("description")} rows={3} placeholder="Product details…" style={{ resize:"vertical" }} /></div>
            <div className="field"><label>Price *</label><input type="number" className="input" value={form.price} onChange={set("price")} required min={0} step="0.01" placeholder="0.00" /></div>
            <div className="field"><label>Currency</label><select className="input" value={form.currency} onChange={set("currency")}><option value="USD">USD</option><option value="MAD">MAD</option><option value="EUR">EUR</option></select></div>
            <div className="field"><label>Category *</label><select className="input" value={form.category} onChange={set("category")} required><option value="">Select…</option>{categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
            <div className="field"><label>Stock</label><input type="number" className="input" value={form.stock} onChange={set("stock")} min={0} /></div>
            <div className="field"><label>Status</label><select className="input" value={form.status} onChange={set("status")}>{PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="field" style={{ gridColumn:"1 / -1" }}><label>Image URLs (one per line)</label><textarea className="input" rows={3} placeholder="https://…" value={form.images.join("\n")} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))} style={{ resize:"vertical" }} /></div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving…" : editId ? "Save changes" : "Create product"}</button>
            <Link to="/products" className="btn btn-ghost">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
