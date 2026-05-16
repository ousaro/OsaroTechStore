import { useState, useMemo, useEffect } from "react";
import { useProducts } from "../hooks/useProducts.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { Select } from "../../../components/ui/Select.jsx";
import { ProductCard } from "../components/ProductCard.jsx";
import { PRODUCT_STATUSES } from "../model/Product.js";
import { FiPackage, FiSearch, FiSliders, FiX } from "react-icons/fi";

export function ProductsPage({ categories }) {
  const { products } = useProducts();
  const { path } = useNavigate();
  const params = useMemo(() => new URLSearchParams(path.includes("?") ? path.split("?")[1] : ""), [path]);

  const [query, setQuery]         = useState(params.get("q") || "");
  const [selectedCat, setSelectedCat] = useState(params.get("category") || "All");
  const [statusFilter, setStatusFilter] = useState("");
  const [maxPrice, setMaxPrice]   = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const availableCategories = useMemo(() => {
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

  useEffect(() => {
    setQuery(params.get("q") || "");
    setSelectedCat(params.get("category") || "All");
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
    setFiltersOpen(false);
    setSortOpen(false);
  };

  return (
    <div className="page-shell">
      <div className="catalog-header">
        <div>
          <div className="section-kicker">Storefront</div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{filtered.length} of {products.length} products ready to browse</p>
          <dl className="catalog-summary-list" aria-label="Current catalog filters">
            <div><dt>Category</dt><dd>{selectedCat === "All" ? "All categories" : selectedCat}</dd></div>
            <div><dt>Status</dt><dd>{statusFilter || "Any status"}</dd></div>
            <div><dt>Price</dt><dd>{maxPrice ? `Under $${maxPrice}` : "Any price"}</dd></div>
          </dl>
        </div>
        <div className="catalog-quick-stats">
          <span><strong>{filtered.length}</strong> visible</span>
          <span><strong>{inStockCount}</strong> in stock</span>
          <span><strong>{activeFilterCount}</strong> filters</span>
        </div>
      </div>
      <div className="catalog-command">
        <div className="catalog-command-search">
          <span className="catalog-search-icon"><FiSearch /></span>
          <input type="text" className="input" placeholder="Search products, accessories, and devices" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="catalog-toolbar">
          <button
            type="button"
            className="catalog-filter-toggle"
            onClick={() => setFiltersOpen((current) => !current)}
            aria-expanded={filtersOpen}
          >
            <FiSliders size={14} /> Filters {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>
          <button
            type="button"
            className="catalog-sort-toggle"
            onClick={() => setSortOpen((current) => !current)}
            aria-expanded={sortOpen}
          >
            Sort
          </button>
          <div className="catalog-active-filters"><FiSliders size={14} /> {activeFilterCount} active</div>
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
        <div className={`catalog-mobile-sort ${sortOpen ? "open" : ""}`}>
          <label className="catalog-sort">
            <span>Sort</span>
            <Select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setSortOpen(false); }}>
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
        <aside className={`catalog-sidebar ${filtersOpen ? "open" : ""}`}>
          <div className="card catalog-filter-card">
            <div className="catalog-filter-head">
              <div>
                <div className="filter-title">Filters</div>
                <p>{activeFilterCount ? `${activeFilterCount} active` : "Refine the catalog"}</p>
              </div>
              {activeFilterCount > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
                  <FiX /> Clear
                </button>
              )}
            </div>

            <div className="filter-section">
              <div className="filter-title">Categories</div>
              <div className="filter-list">
                <button type="button" className={`filter-item ${selectedCat==="All"?"active":""}`} onClick={() => { setSelectedCat("All"); setFiltersOpen(false); }}>All products</button>
                {availableCategories.map((c) => <button type="button" key={c.id} className={`filter-item ${selectedCat===c.name?"active":""}`} onClick={() => { setSelectedCat(c.name); setFiltersOpen(false); }}>{c.name}</button>)}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-title">Status</div>
              <div className="filter-list compact">
                {["", ...PRODUCT_STATUSES].map((s) => <button type="button" key={s} className={`filter-item ${statusFilter===s?"active":""}`} onClick={() => { setStatusFilter(s); setFiltersOpen(false); }}>{s || "All statuses"}</button>)}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-title">Max price (USD)</div>
              <input type="number" className="input" placeholder="e.g. 500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min={0} />
            </div>
          </div>
        </aside>
        <div className="catalog-results">
          <div className="catalog-results-head">
            <div>
              <div className="section-kicker">Collection</div>
              <h2 className="catalog-results-title">Current selection</h2>
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
