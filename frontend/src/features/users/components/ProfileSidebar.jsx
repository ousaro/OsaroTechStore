import { useAuth } from "../../auth/hooks/useAuth.js";
import { Link } from "../../../components/ui/Link.jsx";
import {
  FiArchive,
  FiGrid,
  FiHeart,
  FiKey,
  FiLayers,
  FiMapPin,
  FiShoppingBag,
  FiTag,
  FiTrash2,
  FiUsers,
  FiUser,
} from "react-icons/fi";

const LINKS = [
  { to: "/profile", label: "Profile", icon: FiUser },
  { to: "/profile/address", label: "Address", icon: FiMapPin },
  { to: "/profile/orders", label: "My orders", icon: FiArchive },
  { to: "/profile/favorites", label: "Favorites", icon: FiHeart },
  { to: "/profile/password", label: "Password", icon: FiKey },
  { to: "/profile/delete", label: "Delete account", icon: FiTrash2 },
];

export function ProfileSidebar({ path }) {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);
  const visibleLinks = isAdmin
    ? LINKS.filter(({ to }) => ["/profile", "/profile/password"].includes(to))
    : LINKS;

  return (
    <aside className="sidebar">
      <div className="sidebar-label">{isAdmin ? "Admin account" : "Account"}</div>
      {visibleLinks.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className={`sidebar-link ${path === to ? "active" : ""}`}>
          <Icon size={16} /> {label}
        </Link>
      ))}
      {isAdmin && (
        <>
          <div className="sidebar-label mt-4">Admin</div>
          <Link to="/dashboard" className={`sidebar-link ${path === "/dashboard" ? "active" : ""}`}>
            <FiGrid size={16} /> Dashboard <span className="admin-tag ml-auto">Admin</span>
          </Link>
          <Link
            to="/admin/users"
            className={`sidebar-link ${path === "/admin/users" ? "active" : ""}`}
          >
            <FiUsers size={16} /> Manage users <span className="admin-tag ml-auto">Admin</span>
          </Link>
          <Link
            to="/admin/orders"
            className={`sidebar-link ${path === "/admin/orders" ? "active" : ""}`}
          >
            <FiShoppingBag size={16} /> Manage orders{" "}
            <span className="admin-tag ml-auto">Admin</span>
          </Link>
          <Link
            to="/admin/products"
            className={`sidebar-link ${path === "/admin/products" ? "active" : ""}`}
          >
            <FiLayers size={16} /> Add product <span className="admin-tag ml-auto">Admin</span>
          </Link>
          <Link
            to="/admin/categories"
            className={`sidebar-link ${path === "/admin/categories" ? "active" : ""}`}
          >
            <FiTag size={16} /> Categories <span className="admin-tag ml-auto">Admin</span>
          </Link>
        </>
      )}
    </aside>
  );
}
