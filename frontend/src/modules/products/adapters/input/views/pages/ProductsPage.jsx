import { useState, useMemo } from "react";
import { useProducts } from "../useProductsModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { ProductCard } from "../ProductCard.jsx";
import { PRODUCT_STATUSES } from "../../../../domain/entities/Product.js";
import { FiPackage, FiSearch } from "react-icons/fi";

export function ProductsPage({ categories }) {
  const { products } = useProducts();
  const { path } = useNavigate();
  const params = useMemo(() => new URLSearchParams(path.includes("?") ? path.split("?")[1] : ""), [path]);

  const [query, setQuery]         = useState(params.get("q") || "");
  const [selectedCat, setSelectedCat] = useState("All");
  const [statusFilter, setStatusFilter] = useState("");
  const [maxPrice, setMaxPrice]   = useState("");

  const filtered = useMemo(() => products.filter((p) => {
    if (selectedCat !== "All" && p.category !== selectedCat) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (maxPrice && p.price.amount > Number(maxPrice)) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  }), [products, selectedCat, query, maxPrice, statusFilter]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div><h1 className="page-title">Products</h1><p className="page-subtitle">{filtered.length} of {products.length} products</p></div>
      </div>
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="card filter-card">
            <div className="filter-title">Categories</div>
            <div className={`filter-item ${selectedCat==="All"?"active":""}`} onClick={() => setSelectedCat("All")}>All products</div>
            {categories.map((c) => <div key={c.id} className={`filter-item ${selectedCat===c.name?"active":""}`} onClick={() => setSelectedCat(c.name)}>{c.name}</div>)}
          </div>
          <div className="card filter-card">
            <div className="filter-title">Status</div>
            {["", ...PRODUCT_STATUSES].map((s) => <div key={s} className={`filter-item ${statusFilter===s?"active":""}`} onClick={() => setStatusFilter(s)}>{s || "All statuses"}</div>)}
          </div>
          <div className="card filter-card">
            <div className="filter-title">Max price (USD)</div>
            <input type="number" className="input" placeholder="e.g. 500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min={0} />
          </div>
        </aside>
        <div className="catalog-results">
          <div className="catalog-search">
            <span className="catalog-search-icon"><FiSearch /></span>
            <input type="text" className="input" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {filtered.length === 0
            ? <div className="empty-state"><span className="icon"><FiPackage size={30} /></span><h3>No products found</h3><p>Try adjusting your filters.</p></div>
            : <div className="products-grid">{filtered.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          }
        </div>
      </div>
    </div>
  );
}
