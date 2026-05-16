import { useState } from "react";
import { useCart } from "../../cart/hooks/useCart.js";
import { useUsers } from "../../users/hooks/useUsers.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { Badge } from "../../../components/ui/Badge.jsx";
import { ProductImage } from "../../../components/ui/ProductImage.jsx";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

export function ProductCard({ product: p }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { profile, toggleFavorite } = useUsers();
  const { navigate } = useNavigate();
  const [adding, setAdding] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  const isFav = profile?.hasFavorite(p.id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try { await addToCart(p.id, 1); }
    catch {}
    finally { setAdding(false); }
  };

  const handleToggleFav = async (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setFavoriting(true);
    try {
      await toggleFavorite(p.id, isFav ? "remove" : "add");
    } catch {} finally {
      setFavoriting(false);
    }
  };

  return (
    <article
      className="card card-hover product-card"
      onClick={() => navigate(`/product/${p.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/product/${p.id}`);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${p.name}`}
    >
      <div className="product-img-wrap">
        <ProductImage src={p.primaryImage} alt={p.name} placeholderSize={58} />
        
        {p.status === "new" && <div className="absolute left-2 top-2"><Badge status="new" /></div>}
        <div className="product-actions-overlay">
          <button className="btn btn-primary btn-sm flex-1" onClick={handleAddToCart} disabled={adding || !p.inStock}>
            <FiShoppingBag /> {adding ? "Adding" : p.inStock ? "Add to cart" : "Out of stock"}
          </button>
          <button className="btn btn-sm border-0 bg-white/20 px-2.5 py-1.5 text-white" onClick={handleToggleFav} disabled={favoriting} aria-label={isFav ? "Remove from favorites" : "Add to favorites"}>
            {isFav ? <FaHeart /> : <FiHeart />}
          </button>
        </div>
      </div>
      <div className="product-body">
        <div className="product-category">{p.category}</div>
        <div className="product-name" title={p.name}>{p.name}</div>
        <div className="product-meta-row">
          <span className="product-meta-pill">{p.inStock ? "Ready to ship" : "Notify me"}</span>
          <span className="product-meta-pill">{p.images.length || (p.primaryImage ? 1 : 0)} view{p.images.length === 1 || p.primaryImage ? "" : "s"}</span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="product-price"><span className="currency">{p.price.currency}</span>{p.price.amount.toFixed(2)}</div>
          <Badge status={p.status} />
        </div>
        <div className={`product-stock ${p.lowStock?"low":p.inStock?"":"out"}`}>
          {p.inStock ? (p.lowStock ? `Only ${p.stock} left` : `In stock (${p.stock})`) : "Out of stock"}
        </div>
      </div>
    </article>
  );
}
