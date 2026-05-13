import { FiMail, FiMapPin, FiPhone, FiShield } from "react-icons/fi";
import { Link } from "./Link.jsx";

const primaryLinks = [
  { to: "/home", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/cart", label: "Cart" },
];

const accountLinks = [
  { to: "/profile", label: "Profile" },
  { to: "/profile/orders", label: "Orders" },
  { to: "/profile/address", label: "Address" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Link to="/home" className="footer-logo"><span className="accent">Osaro</span>Tech</Link>
          <p>Focused tech shopping with clear product discovery, secure checkout, and practical support.</p>
          <div className="footer-trust"><FiShield size={16} /> Stripe-powered checkout</div>
        </div>

        <nav className="footer-links" aria-label="Store links">
          <span>Store</span>
          {primaryLinks.map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}
        </nav>

        <nav className="footer-links" aria-label="Account links">
          <span>Account</span>
          {accountLinks.map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}
        </nav>

        <div className="footer-contact">
          <span>Support</span>
          <a href="mailto:hello@osarotech.store"><FiMail /> hello@osarotech.store</a>
          <a href="tel:+65412785285"><FiPhone /> +65 412 785 285</a>
          <p><FiMapPin /> Casablanca, Morocco</p>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} OsaroTech Store</span>
        <span>Built for fast, confident tech shopping.</span>
      </div>
    </footer>
  );
}
