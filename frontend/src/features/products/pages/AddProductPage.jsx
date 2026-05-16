import { useState } from "react";
import { useProducts } from "../hooks/useProducts.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { Link } from "../../../components/ui/Link.jsx";
import { Select } from "../../../components/ui/Select.jsx";
import { PRODUCT_STATUSES } from "../model/Product.js";

export function AddProductPage({ editId, categories }) {
  const { products, createProduct, updateProduct } = useProducts();
  const { navigate } = useNavigate();
  const existing = editId ? products.find((p) => p.id === editId) : null;
  const existingCategoryId =
    existing?.categoryId ||
    categories.find((category) => category.name === existing?.category)?.id ||
    "";

  const [form, setForm] = useState({
    name:        existing?.name            || "",
    description: existing?.description    || "",
    price:       existing?.price.amount   || "",
    currency:    existing?.price.currency || "USD",
    category:    existingCategoryId,
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
    <div className="mx-auto max-w-[800px] px-6 py-10">
      <div className="breadcrumb"><Link to="/products">Products</Link> / <span>{editId ? "Edit" : "Add product"}</span></div>
      <h1 className="page-title mb-7 mt-2">{editId ? "Edit product" : "Add new product"}</h1>
      <form onSubmit={submit}>
        <div className="card p-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field sm:col-span-2"><label>Product name *</label><input className="input" value={form.name} onChange={set("name")} required placeholder="e.g. Samsung Galaxy S24" /></div>
            <div className="field sm:col-span-2"><label>Description</label><textarea className="input resize-y" value={form.description} onChange={set("description")} rows={3} placeholder="Product details…" /></div>
            <div className="field"><label>Price *</label><input type="number" className="input" value={form.price} onChange={set("price")} required min={0} step="0.01" placeholder="0.00" /></div>
            <div className="field"><label>Currency</label><Select value={form.currency} onChange={set("currency")}><option value="USD">USD</option><option value="MAD">MAD</option><option value="EUR">EUR</option></Select></div>
            <div className="field"><label>Category *</label><Select value={form.category} onChange={set("category")} required><option value="">Select…</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
            <div className="field"><label>Stock</label><input type="number" className="input" value={form.stock} onChange={set("stock")} min={0} /></div>
            <div className="field"><label>Status</label><Select value={form.status} onChange={set("status")}>{PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
            <div className="field sm:col-span-2"><label>Image URLs (one per line)</label><textarea className="input resize-y" rows={3} placeholder="https://…" value={form.images.join("\n")} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))} /></div>
          </div>
          <div className="mt-6 flex gap-2.5">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving…" : editId ? "Save changes" : "Create product"}</button>
            <Link to="/products" className="btn btn-ghost">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
