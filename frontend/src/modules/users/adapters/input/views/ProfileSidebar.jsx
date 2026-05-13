import { useAuth } from "../../../../auth/adapters/input/views/useAuthModule.js";
import { Link } from "../../../../../shared/infrastructure/ui/Link.jsx";
import { FiArchive, FiHeart, FiKey, FiMapPin, FiTag, FiTrash2, FiUsers, FiUser } from "react-icons/fi";

const LINKS = [
  { to:"/profile",          label:"Profile",        icon:FiUser },
  { to:"/profile/address",  label:"Address",        icon:FiMapPin },
  { to:"/profile/orders",   label:"My orders",      icon:FiArchive },
  { to:"/profile/favorites",label:"Favorites",      icon:FiHeart },
  { to:"/profile/password", label:"Password",       icon:FiKey },
  { to:"/profile/delete",   label:"Delete account", icon:FiTrash2 },
];

export function ProfileSidebar({ path }) {
  const { user } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar-label">Account</div>
      {LINKS.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className={`sidebar-link ${path===to?"active":""}`}><Icon size={16} /> {label}</Link>
      ))}
      {user?.isAdmin && (
        <>
          <div className="sidebar-label mt-4">Admin</div>
          <Link to="/admin/users"      className={`sidebar-link ${path==="/admin/users"?"active":""}`}><FiUsers size={16} /> Manage users <span className="admin-tag ml-auto">Admin</span></Link>
          <Link to="/admin/categories" className={`sidebar-link ${path==="/admin/categories"?"active":""}`}><FiTag size={16} /> Categories <span className="admin-tag ml-auto">Admin</span></Link>
        </>
      )}
    </aside>
  );
}
