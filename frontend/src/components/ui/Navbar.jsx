import { useEffect, useState } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth.js";
import { useCart } from "../../features/cart/hooks/useCart.js";
import { Avatar } from "./Avatar.jsx";
import { Link } from "./Link.jsx";
import { useNavigate } from "../../hooks/useNavigate.js";
import { FiGrid, FiLayers, FiLogOut, FiMenu, FiMoon, FiSearch, FiShoppingBag, FiSun, FiTag, FiTruck, FiUsers, FiX } from "react-icons/fi";

export function Navbar({ path }) {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { navigate } = useNavigate();
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
    setQuery(params.get("q") || "");
    setMobileOpen(false);
  }, [path]);

  if (!user) return null;

  const isActive = (to) => path.startsWith(to);
  const isAdmin = Boolean(user.isAdmin);
  const homePath = isAdmin ? "/dashboard" : "/home";
  const navLinks = isAdmin
    ? [
      { to:"/dashboard", label:"Dashboard", icon:FiGrid },
      { to:"/admin/users", label:"Users", icon:FiUsers },
      { to:"/admin/orders", label:"Orders", icon:FiShoppingBag },
      { to:"/admin/products", label:"Products", icon:FiLayers },
      { to:"/admin/categories", label:"Categories", icon:FiTag },
    ]
    : [
      { to:"/home",     label:"Home" },
      { to:"/products", label:"Products" },
      { to:"/about",    label:"About" },
    ];

  const submitSearch = (e) => {
    e.preventDefault();
    const next = query.trim();
    setMobileOpen(false);
    if (!isAdmin) navigate(next ? `/products?q=${encodeURIComponent(next)}` : "/products");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={homePath} className="nav-logo">
          <span className="nav-logo-mark">OT</span>
          <span><span className="accent">Osaro</span>Tech{isAdmin ? " Admin" : ""}</span>
        </Link>
        <div className={`nav-center ${mobileOpen ? "open" : ""}`}>
          <div className="nav-links">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${isActive(to) ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {Icon && <Icon size={15} />}
                {label}
              </Link>
            ))}
          </div>
          {!isAdmin && (
            <form className="search-wrap" onSubmit={submitSearch}>
              <span className="search-icon"><FiSearch size={16} /></span>
              <input
                type="text"
                placeholder="Search products, brands, accessories"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
            </form>
          )}
        </div>
        <div className="nav-actions">
          <div className="nav-status"><FiTruck size={14} /> {isAdmin ? "Admin console" : "Fast dispatch"}</div>
          <button
            className="nav-icon-btn"
            onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <FiSun size={19} /> : <FiMoon size={19} />}
          </button>
          {!isAdmin && (
            <button className="nav-icon-btn" onClick={() => navigate("/cart")} title="Cart" aria-label="Cart">
              <FiShoppingBag size={19} />
              {cart.count > 0 && <span className="nav-badge">{cart.count}</span>}
            </button>
          )}
          <button className="nav-icon-btn" onClick={() => navigate("/profile")} title="Profile" aria-label="Profile">
            <Avatar
              src={user.picture}
              name={user.fullName}
              firstName={user.firstName}
              lastName={user.lastName}
              alt={user.fullName}
              className="nav-avatar"
            />
          </button>
          <button className="nav-icon-btn" onClick={logout} title="Log out" aria-label="Log out">
            <FiLogOut size={19} />
          </button>
          <button
            className="nav-icon-btn nav-menu-btn"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FiX size={21} /> : <FiMenu size={21} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
