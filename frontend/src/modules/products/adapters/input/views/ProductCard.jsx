import { useState } from "react";
import { useCart } from "../../../../cart/adapters/input/views/useCartModule.js";
import { useUsers } from "../../../../users/adapters/input/views/useUsersModule.js";
import { useAuth } from "../../../../auth/adapters/input/views/useAuthModule.js";
import { useNavigate } from "../../../../../shared/hooks/useNavigate.js";
import { Badge } from "../../../../../shared/infrastructure/ui/Badge.jsx";
import { FiHeart, FiShoppingBag, FiSmartphone } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

export function ProductCard({ product: p }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { profile, toggleFavorite } = useUsers();
  const { navigate } = useNavigate();
  const [adding, setAdding] = useState(false);

  const isFav = profile?.hasFavorite(p.id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try { await addToCart(p.id, 1); }
    finally { setAdding(false); }
  };

  const handleToggleFav = async (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    await toggleFavorite(p.id, isFav ? "remove" : "add");
  };

  return (
    <div className="card card-hover product-card" onClick={() => navigate(`/product/${p.id}`)}>
      <div className="product-img-wrap">
        {p.primaryImage
          ? <img src={p.primaryImage} alt={p.name} loading="lazy" />
          : <div className="flex h-full items-center justify-center text-ink-faint"><FiSmartphone size={58} /></div>
        }
        {p.status === "new" && <div className="absolute left-2 top-2"><Badge status="new" /></div>}
        <div className="product-actions-overlay">
          <button className="btn btn-primary btn-sm flex-1" onClick={handleAddToCart} disabled={adding || !p.inStock}>
            <FiShoppingBag /> {adding ? "Adding" : p.inStock ? "Add to cart" : "Out of stock"}
          </button>
          <button className="btn btn-sm border-0 bg-white/20 px-2.5 py-1.5 text-white" onClick={handleToggleFav} aria-label={isFav ? "Remove from favorites" : "Add to favorites"}>
            {isFav ? <FaHeart /> : <FiHeart />}
          </button>
        </div>
      </div>
      <div className="product-body">
        <div className="product-category">{p.category}</div>
        <div className="product-name" title={p.name}>{p.name}</div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="product-price"><span className="currency">{p.price.currency}</span>{p.price.amount.toFixed(2)}</div>
          <Badge status={p.status} />
        </div>
        <div className={`product-stock ${p.lowStock?"low":p.inStock?"":"out"}`}>
          {p.inStock ? (p.lowStock ? `Only ${p.stock} left` : `In stock (${p.stock})`) : "Out of stock"}
        </div>
      </div>
    </div>
  );
}
