import { useEffect, useState } from "react";
import { useProducts } from "../hooks/useProducts.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { Link } from "../../../components/ui/Link.jsx";
import { Select } from "../../../components/ui/Select.jsx";
import { PRODUCT_STATUSES } from "../model/Product.js";
import { FiImage, FiUploadCloud, FiX } from "react-icons/fi";

export function AddProductPage({
  editId,
  categories,
  categoriesLoading = false,
  categoriesError = "",
  categoriesInputPort,
  onCategoriesChange,
  onReloadCategories,
}) {
  const { products, createProduct, updateProduct, uploadProductImage } = useProducts();
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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);
  const [localCategoriesLoading, setLocalCategoriesLoading] = useState(false);
  const [localCategoriesError, setLocalCategoriesError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const displayedCategories = localCategories.length ? localCategories : categories;
  const categoryLoading = categoriesLoading || localCategoriesLoading;
  const categoryError = categoriesError || localCategoriesError;

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (categories.length || categoriesLoading || categoriesError || !categoriesInputPort) return;

    let cancelled = false;
    setLocalCategoriesLoading(true);
    setLocalCategoriesError("");

    categoriesInputPort.getAllCategories()
      .then((data) => {
        if (cancelled) return;
        setLocalCategories(data);
        onCategoriesChange?.(data);
      })
      .catch((error) => {
        if (!cancelled) setLocalCategoriesError(error?.message || "Failed to load categories");
      })
      .finally(() => {
        if (!cancelled) setLocalCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categories.length, categoriesError, categoriesInputPort, categoriesLoading, onCategoriesChange]);

  useEffect(() => {
    if (!editId || form.category || !existing?.category || !displayedCategories.length) return;

    const categoryId = displayedCategories.find((category) => category.name === existing.category)?.id;
    if (categoryId) setForm((f) => ({ ...f, category: categoryId }));
  }, [displayedCategories, editId, existing?.category, form.category]);

  const handleImageUpload = async (e) => {
    const files = [...e.target.files].filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;

    setUploadingImages(true);
    try {
      const uploadedImages = await Promise.all(files.map(uploadProductImage));
      setForm((f) => ({ ...f, images: [...f.images, ...uploadedImages] }));
      e.target.value = "";
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

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
            <div className="field">
              <label>Category *</label>
              <Select value={form.category} onChange={set("category")} required disabled={categoryLoading || Boolean(categoryError) || !displayedCategories.length}>
                <option value="">
                  {categoryLoading ? "Loading categories..." : categoryError ? "Categories unavailable" : displayedCategories.length ? "Select..." : "No categories yet"}
                </option>
                {displayedCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              {categoryError && (
                <button type="button" className="category-retry-btn" onClick={onReloadCategories}>Retry loading categories</button>
              )}
              {!categoryLoading && !categoryError && !displayedCategories.length && (
                <Link to="/admin/categories" className="category-retry-btn">Create a category first</Link>
              )}
            </div>
            <div className="field"><label>Stock</label><input type="number" className="input" value={form.stock} onChange={set("stock")} min={0} /></div>
            <div className="field"><label>Status</label><Select value={form.status} onChange={set("status")}>{PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
            <div className="field sm:col-span-2">
              <label>Product images</label>
              <label className="image-upload-dropzone">
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImages} />
                <span className="image-upload-icon"><FiUploadCloud /></span>
                <span className="image-upload-copy">
                  <strong>{uploadingImages ? "Uploading photos..." : "Upload product photos"}</strong>
                  <small>PNG, JPG, WebP, or GIF files</small>
                </span>
              </label>
              {form.images.length > 0 && (
                <div className="image-upload-grid">
                  {form.images.map((image, index) => (
                    <div className="image-upload-preview" key={`${image.slice(0, 42)}-${index}`}>
                      <img src={image} alt={`Product upload ${index + 1}`} />
                      <button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => removeImage(index)}>
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {!form.images.length && (
                <div className="image-upload-empty"><FiImage /> No images uploaded yet</div>
              )}
            </div>
          </div>
          <div className="mt-6 flex gap-2.5">
            <button type="submit" className="btn btn-primary" disabled={loading || uploadingImages}>{loading ? "Saving…" : editId ? "Save changes" : "Create product"}</button>
            <Link to="/products" className="btn btn-ghost">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
