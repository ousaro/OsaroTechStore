import { useEffect, useState } from "react";
import { useAuth } from "../../../modules/auth/adapters/input/views/useAuthModule.js";
import { useCart } from "../../../modules/cart/adapters/input/views/useCartModule.js";
import { Link } from "./Link.jsx";
import { useNavigate } from "../../hooks/useNavigate.js";
import { FiLogOut, FiMoon, FiSearch, FiShoppingBag, FiSun, FiUser } from "react-icons/fi";

export function Navbar({ path }) {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { navigate } = useNavigate();
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  if (!user) return null;

  const isActive = (to) => path.startsWith(to);
  const navLinks = [
    { to:"/home",     label:"Home" },
    { to:"/products", label:"Products" },
    { to:"/about",    label:"About" },
    ...(user.isAdmin ? [{ to:"/dashboard", label:"Dashboard" }, { to:"/admin/products", label:"Add product" }] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/home" className="nav-logo"><span className="accent">Osaro</span>Tech</Link>
        <div className="nav-links">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`nav-link ${isActive(to) ? "active" : ""}`}>{label}</Link>
          ))}
        </div>
        <div className="search-wrap">
          <span className="search-icon"><FiSearch size={16} /></span>
          <input type="text" placeholder="Search products…" onKeyDown={(e) => e.key === "Enter" && navigate(`/products?q=${e.target.value}`)} />
        </div>
        <div className="nav-actions">
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
            {user.picture
              ? <img src={user.picture} className="nav-avatar" alt={user.fullName} />
              : <FiUser size={19} />
            }
          </button>
          <button className="nav-icon-btn" onClick={logout} title="Log out" aria-label="Log out">
            <FiLogOut size={19} />
          </button>
        </div>
      </div>
    </nav>
  );
}
