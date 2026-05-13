import { useState, useEffect } from "react";
import { useProducts } from "../useProductsModule.js";
import { useCart } from "../../../../../cart/adapters/input/views/useCartModule.js";
import { useAuth } from "../../../../../auth/adapters/input/views/useAuthModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { Badge } from "../../../../../../shared/infrastructure/ui/Badge.jsx";
import { QtyControl } from "../../../../../../shared/infrastructure/ui/QtyControl.jsx";
import { Spinner } from "../../../../../../shared/infrastructure/ui/Spinner.jsx";
import { Link } from "../../../../../../shared/infrastructure/ui/Link.jsx";
import { FiCreditCard, FiEdit2, FiRefreshCcw, FiShoppingBag, FiShield, FiSmartphone, FiTrash2, FiTruck } from "react-icons/fi";

export function ProductDetailPage({ id }) {
  const { products, getProductById, deleteProduct } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useNavigate();

  const [product, setProduct]   = useState(() => products.find((p) => p.id === id) || null);
  const [loading, setLoading]   = useState(!product);
  const [qty, setQty]           = useState(1);
  const [adding, setAdding]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (product) return;
    getProductById(id).then(setProduct).catch(() => navigate("/products")).finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  if (loading) return <Spinner full />;
  if (!product) return null;

  const handleAdd = async () => {
    setAdding(true);
    try { await addToCart(product.id, qty); }
    finally { setAdding(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    setDeleting(true);
    try { await deleteProduct(product.id); navigate("/products"); }
    finally { setDeleting(false); }
  };

  const images = product.images.length ? product.images : [null];

  return (
    <div className="page-shell">
      <div className="breadcrumb"><Link to="/products">Products</Link> / <span>{product.name}</span></div>
      <div className="mt-2 grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
        <div>
          <div className="product-detail-media">
            {images[activeImg] ? <img src={images[activeImg]} alt={product.name} /> : <span className="text-ink-faint"><FiSmartphone size={82} /></span>}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.slice(0,6).map((img,i) => (
                <div key={i} onClick={() => setActiveImg(i)} className={`flex h-[72px] w-[72px] cursor-pointer items-center justify-center overflow-hidden rounded-sm border-2 bg-surface-2 ${activeImg===i ? "border-accent" : "border-border"}`}>
                  {img ? <img src={img} alt="" className="h-full w-full object-contain p-2" /> : <FiSmartphone />}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="product-detail-panel">
          <div>
            <div className="mb-3 flex gap-2"><Badge status={product.status} />{product.category && <span className="rounded-sm bg-surface-3 px-2 py-0.5 text-xs font-semibold">{product.category}</span>}</div>
            <h1 className="mb-3 font-display text-[clamp(30px,4vw,46px)] font-extrabold leading-tight tracking-[-.03em]">{product.name}</h1>
            <div className="mb-3 text-4xl font-black tracking-[-1px] text-accent tabular-nums">
              <span className="text-lg font-bold">{product.price.currency} </span>{product.price.amount.toFixed(2)}
            </div>
            {product.description && <p className="text-[15px] leading-7 text-ink-muted">{product.description}</p>}
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center gap-2">
            <span className={`status-dot ${product.inStock?(product.lowStock?"yellow":"green"):"red"}`} />
            <span className="text-sm font-semibold">
              {product.inStock ? (product.lowStock ? `Low stock — only ${product.stock} left` : `In stock (${product.stock} units)`) : "Out of stock"}
            </span>
          </div>
          {product.inStock && (
            <div className="flex items-center gap-3">
              <QtyControl value={qty} min={1} max={product.stock} onDecrement={() => setQty((q) => Math.max(1,q-1))} onIncrement={() => setQty((q) => Math.min(product.stock,q+1))} />
              <button className="btn btn-primary flex-1" onClick={handleAdd} disabled={adding}><FiShoppingBag /> {adding ? "Adding…" : "Add to cart"}</button>
            </div>
          )}
          <div className="product-trust-grid">
            <div><FiTruck /><span>Fast dispatch</span></div>
            <div><FiShield /><span>Protected payment</span></div>
            <div><FiRefreshCcw /><span>Easy support</span></div>
            <div><FiCreditCard /><span>Secure checkout</span></div>
          </div>
          {user?.isAdmin && (
            <div className="flex gap-2">
              <Link to={`/admin/edit-product/${product.id}`} className="btn btn-ghost"><FiEdit2 /> Edit</Link>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}><FiTrash2 /> {deleting ? "Deleting…" : "Delete"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
