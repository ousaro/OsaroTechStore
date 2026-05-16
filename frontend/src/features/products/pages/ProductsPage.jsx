import { useState, useMemo, useEffect } from "react";
import { useProducts } from "../hooks/useProducts.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { Select } from "../../../components/ui/Select.jsx";
import { ProductCard } from "../components/ProductCard.jsx";
import { PRODUCT_STATUSES } from "../model/Product.js";
import { FiGrid, FiPackage, FiSearch, FiSliders, FiX, FiZap } from "react-icons/fi";

export function ProductsPage({ categories }) {
  const { products } = useProducts();
  const { path } = useNavigate();
  const params = useMemo(() => new URLSearchParams(path.includes("?") ? path.split("?")[1] : ""), [path]);

  const [query, setQuery]         = useState(params.get("q") || "");
  const [selectedCat, setSelectedCat] = useState("All");
  const [statusFilter, setStatusFilter] = useState("");
  const [maxPrice, setMaxPrice]   = useState("");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    setQuery(params.get("q") || "");
  }, [params]);

  const filtered = useMemo(() => {
    const base = products.filter((p) => {
      if (selectedCat !== "All" && p.category !== selectedCat) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (maxPrice && p.price.amount > Number(maxPrice)) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });

    const sorted = [...base];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "stock":
        sorted.sort((a, b) => b.stock - a.stock);
        break;
      default:
        sorted.sort((a, b) => Number(b.inStock) - Number(a.inStock) || Number(b.status === "new") - Number(a.status === "new"));
    }

    return sorted;
  }, [products, selectedCat, query, maxPrice, statusFilter, sortBy]);

  const activeFilterCount = [selectedCat !== "All", Boolean(statusFilter), Boolean(maxPrice), Boolean(query)].filter(Boolean).length;
  const inStockCount = filtered.filter((product) => product.inStock).length;
  const resetFilters = () => {
    setSelectedCat("All");
    setStatusFilter("");
    setMaxPrice("");
    setQuery("");
    setSortBy("featured");
  };

  return (
    <div className="page-shell">
      <div className="catalog-hero">
        <div>
          <div className="section-kicker">Storefront</div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{filtered.length} of {products.length} products ready to browse</p>
          <div className="catalog-chip-row mt-4">
            <span className={`catalog-chip ${selectedCat === "All" ? "active" : ""}`}>{selectedCat === "All" ? "All categories" : selectedCat}</span>
            <span className={`catalog-chip ${statusFilter ? "active" : ""}`}>{statusFilter || "Any status"}</span>
            <span className={`catalog-chip ${maxPrice ? "active" : ""}`}>{maxPrice ? `Under $${maxPrice}` : "Any price"}</span>
          </div>
        </div>
        <div className="catalog-overview-grid">
          <div className="catalog-overview-card">
            <span>Visible now</span>
            <strong>{filtered.length}</strong>
          </div>
          <div className="catalog-overview-card">
            <span>In stock</span>
            <strong>{inStockCount}</strong>
          </div>
          <div className="catalog-overview-card">
            <span>Filters</span>
            <strong>{activeFilterCount}</strong>
          </div>
        </div>
      </div>
      <div className="catalog-command">
        <div className="catalog-command-search">
          <span className="catalog-search-icon"><FiSearch /></span>
          <input type="text" className="input" placeholder="Search products, accessories, and devices" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="catalog-toolbar">
          <div className="catalog-active-filters"><FiZap size={14} /> {inStockCount} ready to ship</div>
          <div className="catalog-active-filters"><FiSliders size={14} /> {activeFilterCount} active filters</div>
          <label className="catalog-sort">
            <span>Sort</span>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
              <option value="stock">Stock level</option>
            </Select>
          </label>
        </div>
      </div>
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="card filter-card">
            <div className="filter-title">Browse flow</div>
            <div className="catalog-sidebar-note"><FiGrid size={15} /> Filters stay visible while products keep center stage.</div>
          </div>
          <div className="card filter-card">
            <div className="filter-title">Categories</div>
            <button type="button" className={`filter-item ${selectedCat==="All"?"active":""}`} onClick={() => setSelectedCat("All")}>All products</button>
            {categories.map((c) => <button type="button" key={c.id} className={`filter-item ${selectedCat===c.name?"active":""}`} onClick={() => setSelectedCat(c.name)}>{c.name}</button>)}
          </div>
          <div className="card filter-card">
            <div className="filter-title">Status</div>
            {["", ...PRODUCT_STATUSES].map((s) => <button type="button" key={s} className={`filter-item ${statusFilter===s?"active":""}`} onClick={() => setStatusFilter(s)}>{s || "All statuses"}</button>)}
          </div>
          <div className="card filter-card">
            <div className="filter-title">Max price (USD)</div>
            <input type="number" className="input" placeholder="e.g. 500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min={0} />
            {activeFilterCount > 0 && (
              <button type="button" className="btn btn-ghost btn-sm mt-3 w-full" onClick={resetFilters}>
                <FiX /> Clear filters
              </button>
            )}
          </div>
        </aside>
        <div className="catalog-results">
          <div className="catalog-results-head">
            <div>
              <div className="section-kicker">Collection view</div>
              <h2 className="text-[24px] font-extrabold text-ink">Browse the current selection</h2>
            </div>
            <div className="catalog-results-meta">
              <span>{filtered.length} results</span>
              <span>{inStockCount} shipping now</span>
            </div>
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
