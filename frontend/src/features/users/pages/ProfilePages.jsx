import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useUsers } from "../hooks/useUsers.js";
import { useProducts } from "../../products/hooks/useProducts.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { ProfileSidebar } from "../components/ProfileSidebar.jsx";
import { Avatar } from "../../../components/ui/Avatar.jsx";
import { PasswordInput } from "../../../components/ui/PasswordInput.jsx";
import { ProductCard } from "../../products/components/ProductCard.jsx";
import { getErrorMessage } from "../../../lib/errorUtils.js";
import { FiAlertTriangle, FiEdit2, FiHeart, FiImage, FiInfo, FiTrash2, FiUploadCloud, FiX } from "react-icons/fi";

export function ProfilePage() {
  const { profile, updateProfile } = useUsers();
  const { uploadProductImage } = useProducts();
  const { path } = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: profile?.firstName || "", lastName: profile?.lastName || "",
    email: profile?.email || "", phone: profile?.phone || "", picture: profile?.picture || "",
  });
  const canManageProfilePicture = Boolean(profile?.isAdmin);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    setForm({
      firstName: profile?.firstName || "", lastName: profile?.lastName || "",
      email: profile?.email || "", phone: profile?.phone || "", picture: profile?.picture || "",
    });
  }, [profile]);

  const handlePictureUpload = async (e) => {
    if (!canManageProfilePicture) return;

    const file = [...e.target.files].find((candidate) => candidate.type.startsWith("image/"));
    if (!file) return;

    setUploadingPicture(true);
    setError("");
    try {
      const uploadedImage = await uploadProductImage(file);
      setForm((f) => ({ ...f, picture: uploadedImage }));
      e.target.value = "";
    } catch (err) {
      setError(getErrorMessage(err, "Could not upload your profile picture. Please try again."));
    } finally {
      setUploadingPicture(false);
    }
  };

  const cancelEdit = () => {
    setForm({
      firstName: profile?.firstName || "", lastName: profile?.lastName || "",
      email: profile?.email || "", phone: profile?.phone || "", picture: profile?.picture || "",
    });
    setEditing(false);
  };

  const save = async (e) => {
    e.preventDefault(); setLoading(true);
    setError("");
    try { await updateProfile(form); setEditing(false); }
    catch (err) { setError(getErrorMessage(err, "Could not save your profile. Please try again.")); }
    finally { setLoading(false); }
  };

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header">
          <div><h1 className="page-title">Profile information</h1><p className="page-subtitle">Manage your personal details</p></div>
          {!editing && <button className="btn btn-ghost" onClick={() => setEditing(true)}><FiEdit2 /> Edit</button>}
        </div>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={save}>
          <div className="card p-5 sm:p-7">
            <div className="mb-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
              <Avatar
                src={form.picture}
                name={profile?.fullName}
                firstName={form.firstName}
                lastName={form.lastName}
                alt={profile?.fullName || "Profile"}
                className="profile-avatar"
              />
              <div className="min-w-0">
                <div className="text-xl font-bold">{profile?.fullName}</div>
                <div className="break-all text-sm text-ink-muted">{profile?.email}</div>
                {profile?.isAdmin && <span className="admin-tag mt-1.5 inline-block">Admin</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="field"><label>First name</label><input className="input" value={form.firstName} onChange={set("firstName")} readOnly={!editing} required /></div>
              <div className="field"><label>Last name</label><input className="input" value={form.lastName} onChange={set("lastName")} readOnly={!editing} required /></div>
              <div className="field"><label>Email</label><input type="email" className="input" value={form.email} onChange={set("email")} readOnly={!editing} required /></div>
              <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={set("phone")} readOnly={!editing} placeholder="+212 600 000 000" /></div>
              {editing && canManageProfilePicture && (
                <div className="field sm:col-span-2">
                  <label>Profile picture</label>
                  <label className="image-upload-dropzone profile-picture-dropzone">
                    <input type="file" accept="image/*" onChange={handlePictureUpload} disabled={uploadingPicture} />
                    <span className="image-upload-icon"><FiUploadCloud /></span>
                    <span className="image-upload-copy">
                      <strong>{uploadingPicture ? "Uploading picture..." : "Upload profile picture"}</strong>
                      <small>PNG, JPG, WebP, or GIF files</small>
                    </span>
                  </label>
                  {form.picture ? (
                    <div className="profile-picture-preview">
                      <Avatar
                        src={form.picture}
                        name={profile?.fullName}
                        firstName={form.firstName}
                        lastName={form.lastName}
                        alt="Profile preview"
                        className="profile-avatar"
                      />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm((f) => ({ ...f, picture: "" }))}>
                        <FiX /> Remove picture
                      </button>
                    </div>
                  ) : (
                    <div className="image-upload-empty"><FiImage /> No profile picture selected</div>
                  )}
                </div>
              )}
            </div>
            {editing && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button type="submit" className="btn btn-primary" disabled={loading || uploadingPicture}>{loading ? "Saving…" : "Save changes"}</button>
                <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddressPage() {
  const { profile, updateProfile } = useUsers();
  const { path } = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ address: profile?.address||"", city: profile?.city||"", state: profile?.state||"", postalCode: String(profile?.postalCode||""), country: profile?.country||"" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try { await updateProfile(form); }
    catch (err) { setError(getErrorMessage(err, "Could not save your address. Please try again.")); }
    finally { setLoading(false); }
  };

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header"><div><h1 className="page-title">Address information</h1><p className="page-subtitle">Your default delivery address</p></div></div>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={save}>
          <div className="card p-5 sm:p-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="field sm:col-span-2"><label>Street address</label><input className="input" placeholder="123 Main Street" value={form.address} onChange={set("address")} /></div>
              <div className="field"><label>City</label><input className="input" placeholder="Casablanca" value={form.city} onChange={set("city")} /></div>
              <div className="field"><label>State / Region</label><input className="input" placeholder="Grand Casablanca" value={form.state} onChange={set("state")} /></div>
              <div className="field"><label>Postal code</label><input className="input" placeholder="20000" value={form.postalCode} onChange={set("postalCode")} /></div>
              <div className="field"><label>Country</label><input className="input" placeholder="Morocco" value={form.country} onChange={set("country")} /></div>
            </div>
            <div className="mt-5"><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving…" : "Save address"}</button></div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PasswordPage() {
  const { path } = useNavigate();
  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header"><div><h1 className="page-title">Change password</h1><p className="page-subtitle">Update your account password</p></div></div>
        <div className="card max-w-[480px] p-5 sm:p-7">
          <div className="info-box mb-5"><FiInfo /> Password update is not yet exposed in API v1.0.0.</div>
          <div className="pointer-events-none flex flex-col gap-4 opacity-50">
            <PasswordInput label="Current password" name="cur" value="" onChange={() => {}} />
            <PasswordInput label="New password"     name="new" value="" onChange={() => {}} />
            <PasswordInput label="Confirm"          name="con" value="" onChange={() => {}} />
          </div>
          <button className="btn btn-primary mt-5" disabled>Change password</button>
        </div>
      </div>
    </div>
  );
}

export function FavoritesPage() {
  const { profile } = useUsers();
  const { products } = useProducts();
  const { path } = useNavigate();

  const favorites = useMemo(() =>
    products.filter((p) => profile?.hasFavorite(p.id)),
    [products, profile]
  );

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header">
          <div>
            <h1 className="page-title">My favorites</h1>
            <p className="page-subtitle">{favorites.length} favorited product{favorites.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        {favorites.length === 0 ? (
          <div className="empty-state pt-12">
            <span className="icon"><FiHeart size={30} /></span>
            <h3>No favorites yet</h3>
            <p>Heart the products you like and they will show up here.</p>
          </div>
        ) : (
          <div className="products-grid">{favorites.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </div>
    </div>
  );
}

export function DeleteAccountPage() {
  const { user } = useAuth();
  const { deleteAccount } = useUsers();
  const { path, navigate } = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!confirmed) return;
    setLoading(true);
    setError("");
    try { await deleteAccount(user.id); navigate("/login"); }
    catch (err) { setError(getErrorMessage(err, "Could not delete your account. Please try again.")); }
    finally { setLoading(false); }
  };

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header"><div><h1 className="page-title text-accent">Delete account</h1><p className="page-subtitle">Permanently remove your account</p></div></div>
        {error && <div className="error-box">{error}</div>}
        <div className="card max-w-[560px] p-5 sm:p-7">
          <div className="danger-panel mb-6">
            <strong className="danger-panel-title"><FiAlertTriangle /> This action is permanent</strong>
            <p className="danger-panel-copy">This cannot be undone. All your data will be erased.</p>
          </div>
          <label className="mb-6 flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            I understand this is permanent
          </label>
          <button className="btn btn-danger flex-wrap px-6 py-2.5" onClick={handle} disabled={!confirmed||loading}><FiTrash2 /> {loading ? "Deleting…" : "Delete my account permanently"}</button>
        </div>
      </div>
    </div>
  );
}
