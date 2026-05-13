import { useState, useEffect } from "react";
import { useProducts } from "../useProductsModule.js";
import { useCart } from "../../../../../cart/adapters/input/views/useCartModule.js";
import { useAuth } from "../../../../../auth/adapters/input/views/useAuthModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { Badge } from "../../../../../../shared/infrastructure/ui/Badge.jsx";
import { QtyControl } from "../../../../../../shared/infrastructure/ui/QtyControl.jsx";
import { Spinner } from "../../../../../../shared/infrastructure/ui/Spinner.jsx";
import { Link } from "../../../../../../shared/infrastructure/ui/Link.jsx";
import { FiEdit2, FiShoppingBag, FiSmartphone, FiTrash2 } from "react-icons/fi";

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
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start", marginTop:8 }}>
        <div>
          <div style={{ background:"var(--surface-2)", borderRadius:"var(--radius-lg)", aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
            {images[activeImg] ? <img src={images[activeImg]} alt={product.name} style={{ maxWidth:"80%", maxHeight:"80%", objectFit:"contain" }} /> : <span style={{ color:"var(--ink-faint)" }}><FiSmartphone size={82} /></span>}
          </div>
          {images.length > 1 && (
            <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
              {images.slice(0,6).map((img,i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ width:72,height:72,borderRadius:"var(--radius-sm)",background:"var(--surface-2)",cursor:"pointer",overflow:"hidden",border:`2px solid ${activeImg===i?"var(--accent)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {img ? <img src={img} alt="" style={{ width:"100%",height:"100%",objectFit:"contain",padding:8 }} /> : <FiSmartphone />}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}><Badge status={product.status} />{product.category && <span style={{ background:"var(--surface-3)",padding:"2px 8px",borderRadius:"var(--radius-sm)",fontSize:12,fontWeight:600 }}>{product.category}</span>}</div>
            <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:"-.5px", marginBottom:12, lineHeight:1.25 }}>{product.name}</h1>
            <div style={{ fontSize:36, fontWeight:900, letterSpacing:"-1px", color:"var(--accent)", marginBottom:12 }}>
              <span style={{ fontSize:18, fontWeight:700 }}>{product.price.currency} </span>{product.price.amount.toFixed(2)}
            </div>
            {product.description && <p style={{ fontSize:15, color:"var(--ink-muted)", lineHeight:1.7 }}>{product.description}</p>}
          </div>
          <div style={{ height:1, background:"var(--border)" }} />
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span className={`status-dot ${product.inStock?(product.lowStock?"yellow":"green"):"red"}`} />
            <span style={{ fontSize:14, fontWeight:600 }}>
              {product.inStock ? (product.lowStock ? `Low stock — only ${product.stock} left` : `In stock (${product.stock} units)`) : "Out of stock"}
            </span>
          </div>
          {product.inStock && (
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <QtyControl value={qty} min={1} max={product.stock} onDecrement={() => setQty((q) => Math.max(1,q-1))} onIncrement={() => setQty((q) => Math.min(product.stock,q+1))} />
              <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={handleAdd} disabled={adding}><FiShoppingBag /> {adding ? "Adding…" : "Add to cart"}</button>
            </div>
          )}
          {user?.isAdmin && (
            <div style={{ display:"flex", gap:8 }}>
              <Link to={`/admin/edit-product/${product.id}`} className="btn btn-ghost"><FiEdit2 /> Edit</Link>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}><FiTrash2 /> {deleting ? "Deleting…" : "Delete"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
