import { useEffect, useState } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth.js";
import { useCart } from "../../features/cart/hooks/useCart.js";
import { Avatar } from "./Avatar.jsx";
import { Link } from "./Link.jsx";
import { useNavigate } from "../../hooks/useNavigate.js";
import { FiLogOut, FiMoon, FiSearch, FiShoppingBag, FiSun, FiTruck } from "react-icons/fi";

export function Navbar({ path }) {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { navigate } = useNavigate();
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
    setQuery(params.get("q") || "");
  }, [path]);

  if (!user) return null;

  const isActive = (to) => path.startsWith(to);
  const navLinks = [
    { to:"/home",     label:"Home" },
    { to:"/products", label:"Products" },
    { to:"/about",    label:"About" },
    ...(user.isAdmin ? [{ to:"/dashboard", label:"Dashboard" }, { to:"/admin/products", label:"Add product" }] : []),
  ];

  const submitSearch = (e) => {
    e.preventDefault();
    const next = query.trim();
    navigate(next ? `/products?q=${encodeURIComponent(next)}` : "/products");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/home" className="nav-logo">
          <span className="nav-logo-mark">OT</span>
          <span><span className="accent">Osaro</span>Tech</span>
        </Link>
        <div className="nav-center">
          <div className="nav-links">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={`nav-link ${isActive(to) ? "active" : ""}`}>{label}</Link>
            ))}
          </div>
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
        </div>
        <div className="nav-actions">
          <div className="nav-status"><FiTruck size={14} /> Fast dispatch</div>
          <button
            className="nav-icon-btn"
            onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <FiSun size={19} /> : <FiMoon size={19} />}
          </button>
          <button className="nav-icon-btn" onClick={() => navigate("/cart")} title="Cart" aria-label="Cart">
            <FiShoppingBag size={19} />
            {cart.count > 0 && <span className="nav-badge">{cart.count}</span>}
          </button>
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
        </div>
      </div>
    </nav>
  );
}
