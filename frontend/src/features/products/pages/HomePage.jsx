import { useState, useMemo } from "react";
import { useProducts } from "../hooks/useProducts.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { ProductImage } from "../../../components/ui/ProductImage.jsx";
import { FiArrowRight, FiBox, FiCpu, FiGrid, FiShield, FiTruck } from "react-icons/fi";

export function HomePage({ categories }) {
  const { products } = useProducts();
  const { navigate } = useNavigate();
  const [selectedCat, setSelectedCat] = useState("all");
  const inStockCount = products.filter((product) => product.inStock).length;
  const heroProduct = products.find((product) => product.primaryImage) || products[0];
  const newestProducts = [...products].sort((a, b) => Number(b.status === "new") - Number(a.status === "new")).slice(0, 3);
  const shopCategories = useMemo(() => {
    const byName = new Map();

    categories.forEach((category) => {
      if (category?.name) byName.set(category.name, category);
    });

    products.forEach((product) => {
      if (product.category && !byName.has(product.category)) {
        byName.set(product.category, { id: `product-category-${product.category}`, name: product.category });
      }
    });

    return [...byName.values()];
  }, [categories, products]);
  const featuredCategories = shopCategories.slice(0, 4);

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
            <h1 className="hero-title">Premium tech, picked with <em>precision</em></h1>
            <p className="hero-sub">Shop phones, accessories, and everyday devices in a faster storefront built around clear product discovery, confident comparison, and secure checkout.</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/products")}>Shop now <FiArrowRight /></button>
              <button className="btn btn-lg muted-cta" onClick={() => navigate("/about")}>About us</button>
            </div>
            <div className="hero-stat-row">
              <div className="hero-stat">
                <span className="hero-stat-value">{products.length}</span>
                <span className="hero-stat-label">live products</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">{shopCategories.length}</span>
                <span className="hero-stat-label">shop categories</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">{inStockCount}</span>
                <span className="hero-stat-label">ready to ship</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            {heroProduct && (
              <div className="hero-product-card">
                <div className="hero-product-media">
                  <ProductImage src={heroProduct.primaryImage} alt={heroProduct.name} placeholderSize={88} />
                </div>
                <div className="hero-product-info">
                  <div>
                    <div className="hero-product-name">{heroProduct.name}</div>
                    <div className="hero-card-sub">{heroProduct.category || "Featured device"}</div>
                  </div>
                  <div className="hero-product-price">{heroProduct.price.currency} {heroProduct.price.amount.toFixed(2)}</div>
                </div>
              </div>
            )}
            <div className="hero-card wide">
              <span className="hero-card-icon"><FiBox size={22} /></span>
              <div><div className="hero-card-title">{products.length} products</div><div className="hero-card-sub">Across all categories</div></div>
            </div>
            <div className="hero-card"><span className="hero-card-icon"><FiGrid size={22} /></span><div className="hero-card-title">{shopCategories.length} categories</div><div className="hero-card-sub">Something for everyone</div></div>
            <div className="hero-card"><span className="hero-card-icon"><FiTruck size={22} /></span><div className="hero-card-title">Fast delivery</div><div className="hero-card-sub">To your door</div></div>
            <div className="hero-card"><span className="hero-card-icon"><FiShield size={22} /></span><div className="hero-card-title">Secure checkout</div><div className="hero-card-sub">Stripe-powered</div></div>
          </div>
        </div>
      </section>

      <div className="home-featured">
        <section className="discovery-grid">
          <div className="discovery-panel discovery-panel-large">
            <div className="section-kicker">Shop by focus</div>
            <div className="discovery-head">
              <div>
                <h2 className="page-title">Collections built for how people actually shop</h2>
                <p className="page-subtitle">Cleaner paths into phones, accessories, and ready-to-ship essentials.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => navigate("/products")}>Open catalog <FiArrowRight /></button>
            </div>
            <div className="discovery-category-grid">
              {featuredCategories.map((category) => {
                const count = products.filter((product) => product.category === category.name).length;
                return (
                  <button
                    key={category.id}
                    className={`featured-category-card ${selectedCat === category.name ? "active" : ""}`}
                    onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
                  >
                    <span className="featured-category-name">{category.name}</span>
                    <span className="featured-category-meta">{count} items</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="discovery-stack">
            {heroProduct && (
              <button className="discovery-panel spotlight-card" onClick={() => navigate(`/product/${heroProduct.id}`)}>
                <div className="section-kicker">Spotlight pick</div>
                <div className="spotlight-card-body">
                  <div className="spotlight-copy">
                    <h3>{heroProduct.name}</h3>
                    <p>{heroProduct.category || "Featured product"} ready for a faster path to purchase.</p>
                    <span className="spotlight-price">{heroProduct.price.currency} {heroProduct.price.amount.toFixed(2)}</span>
                  </div>
                  <div className="spotlight-media">
                    <ProductImage src={heroProduct.primaryImage} alt={heroProduct.name} placeholderSize={72} />
                  </div>
                </div>
              </button>
            )}
          </div>
        </section>

        <div className="home-featured-head">
          <div>
            <div className="section-kicker">Featured shelf</div>
            <h2 className="page-title">Curated tech picks</h2>
            <p className="page-subtitle">A tighter product shelf with clearer entry points and less visual noise.</p>
          </div>
          {filtered.length > 0 && <button className="btn btn-ghost" onClick={() => navigate("/products")}>View all <FiArrowRight /></button>}
        </div>
        <div className="category-strip mb-7">
          <button className={`category-pill ${selectedCat==="all"?"active":""}`} onClick={() => setSelectedCat("all")}>All products</button>
          {shopCategories.map((c) => (
            <button key={c.id} className={`category-pill ${selectedCat===c.name?"active":""}`} onClick={() => setSelectedCat(c.name)}>{c.name}</button>
          ))}
        </div>
        {newestProducts.length > 0 && (
          <section className="launch-strip">
            <div>
              <div className="section-kicker">New on shelf</div>
              <h3 className="launch-strip-title">Fresh arrivals worth a first look</h3>
            </div>
            <div className="launch-strip-list">
              {newestProducts.map((product) => (
                <button key={product.id} className="launch-chip" onClick={() => navigate(`/product/${product.id}`)}>
                  <span className="launch-chip-name">{product.name}</span>
                  <span className="launch-chip-price">{product.price.currency} {product.price.amount.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </section>
        )}
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
