import { useState, useMemo } from "react";
import { useProducts } from "../useProductsModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { ProductCard } from "../ProductCard.jsx";
import { FiArrowRight, FiBox, FiCpu, FiGrid, FiShield, FiStar, FiTruck, FiZap } from "react-icons/fi";

export function HomePage({ categories }) {
  const { products } = useProducts();
  const { navigate } = useNavigate();
  const [selectedCat, setSelectedCat] = useState("all");

  const filtered = useMemo(() => {
    const base = selectedCat === "all" ? products : products.filter((p) => p.category === selectedCat);
    return base.slice(0, 12);
  }, [products, selectedCat]);

  return (
    <div>
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-eyebrow"><FiCpu size={14} /> New arrivals every week</div>
            <h1 className="hero-title">The future of<br /><em>tech</em> in your hands</h1>
            <p className="hero-sub">Explore phones, accessories, and exclusive deals. From discovery to checkout, every interaction is built to feel fast, clear, and premium.</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/products")}>Shop now <FiArrowRight /></button>
              <button className="btn btn-lg muted-cta" onClick={() => navigate("/about")}>About us</button>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                [FiZap, "Same-day prep", "Ready fast"],
                [FiStar, "Curated picks", "No noisy catalog"],
                [FiShield, "Protected pay", "Secure checkout"],
              ].map(([Icon, title, sub]) => (
                <div key={title} className="flex min-h-20 items-center gap-3 rounded-lg border border-[var(--hero-card-border)] bg-[var(--hero-card-bg)] px-4 py-3 text-[var(--hero-text)] shadow-soft backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[var(--hero-icon-bg)] text-[var(--hero-icon-color)]">
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold leading-tight">{title}</span>
                    <span className="block text-xs leading-snug text-[var(--hero-card-muted)]">{sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card wide">
              <span className="hero-card-icon"><FiBox size={22} /></span>
              <div><div className="hero-card-title">{products.length} products</div><div className="hero-card-sub">Across all categories</div></div>
            </div>
            <div className="hero-card"><span className="hero-card-icon"><FiGrid size={22} /></span><div className="hero-card-title">{categories.length} categories</div><div className="hero-card-sub">Something for everyone</div></div>
            <div className="hero-card"><span className="hero-card-icon"><FiTruck size={22} /></span><div className="hero-card-title">Fast delivery</div><div className="hero-card-sub">To your door</div></div>
            <div className="hero-card"><span className="hero-card-icon"><FiShield size={22} /></span><div className="hero-card-title">Secure checkout</div><div className="hero-card-sub">Stripe-powered</div></div>
          </div>
        </div>
      </section>

      <div className="home-featured">
        <div className="home-featured-head">
          <div>
            <div className="section-kicker">Featured shelf</div>
            <h2 className="page-title">Curated tech picks</h2>
            <p className="page-subtitle">Fresh devices and accessories filtered by what you care about.</p>
          </div>
          {filtered.length > 0 && <button className="btn btn-ghost" onClick={() => navigate("/products")}>View all <FiArrowRight /></button>}
        </div>
        <div className="category-strip mb-7">
          <button className={`category-pill ${selectedCat==="all"?"active":""}`} onClick={() => setSelectedCat("all")}>All products</button>
          {categories.map((c) => (
            <button key={c.id} className={`category-pill ${selectedCat===c.name?"active":""}`} onClick={() => setSelectedCat(c.name)}>{c.name}</button>
          ))}
        </div>
        {filtered.length === 0
          ? <div className="empty-state"><span className="icon"><FiBox size={30} /></span><h3>No products yet</h3><p>Check back soon.</p></div>
          : <div className="products-grid">{filtered.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        }
        {filtered.length > 0 && (
          <div className="mt-10 text-center">
            <button className="btn btn-primary px-8 py-3" onClick={() => navigate("/products")}>Browse full catalog <FiArrowRight /></button>
          </div>
        )}
      </div>
    </div>
  );
}
