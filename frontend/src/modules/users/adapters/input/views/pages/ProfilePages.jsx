import { useState } from "react";
import { useAuth } from "../../../../../auth/adapters/input/views/useAuthModule.js";
import { useUsers } from "../useUsersModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { ProfileSidebar } from "../ProfileSidebar.jsx";
import { PasswordInput } from "../../../../../../shared/infrastructure/ui/PasswordInput.jsx";
import { FiAlertTriangle, FiEdit2, FiInfo, FiTrash2 } from "react-icons/fi";

export function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUsers();
  const { path } = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: profile?.firstName || "", lastName: profile?.lastName || "",
    email: profile?.email || "", phone: profile?.phone || "", picture: profile?.picture || "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await updateProfile(form); setEditing(false); }
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
        <form onSubmit={save}>
          <div className="card p-7">
            <div className="mb-7 flex items-center gap-5">
              <img src={form.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName||"U")}&background=ff4d5e&color=11131b&size=80`} alt="" className="h-20 w-20 rounded-full border-[3px] border-border object-cover" />
              <div>
                <div className="text-xl font-bold">{profile?.fullName}</div>
                <div className="text-sm text-ink-muted">{profile?.email}</div>
                {profile?.isAdmin && <span className="admin-tag mt-1.5 inline-block">Admin</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="field"><label>First name</label><input className="input" value={form.firstName} onChange={set("firstName")} readOnly={!editing} required /></div>
              <div className="field"><label>Last name</label><input className="input" value={form.lastName} onChange={set("lastName")} readOnly={!editing} required /></div>
              <div className="field"><label>Email</label><input type="email" className="input" value={form.email} onChange={set("email")} readOnly={!editing} required /></div>
              <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={set("phone")} readOnly={!editing} placeholder="+212 600 000 000" /></div>
              {editing && <div className="field sm:col-span-2"><label>Picture URL</label><input className="input" value={form.picture} onChange={set("picture")} placeholder="https://…" /></div>}
            </div>
            {editing && (
              <div className="mt-5 flex gap-2.5">
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving…" : "Save changes"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
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
  const [form, setForm] = useState({ address: profile?.address||"", city: profile?.city||"", state: profile?.state||"", postalCode: String(profile?.postalCode||""), country: profile?.country||"" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async (e) => { e.preventDefault(); setLoading(true); try { await updateProfile(form); } finally { setLoading(false); } };

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header"><div><h1 className="page-title">Address information</h1><p className="page-subtitle">Your default delivery address</p></div></div>
        <form onSubmit={save}>
          <div className="card p-7">
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
        <div className="card max-w-[480px] p-7">
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

export function DeleteAccountPage() {
  const { user } = useAuth();
  const { deleteAccount } = useUsers();
  const { path, navigate } = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!confirmed) return;
    setLoading(true);
    try { await deleteAccount(user.id); navigate("/login"); }
    finally { setLoading(false); }
  };

  return (
    <div className="sidebar-layout">
      <ProfileSidebar path={path} />
      <div className="content-area">
        <div className="page-header"><div><h1 className="page-title text-accent">Delete account</h1><p className="page-subtitle">Permanently remove your account</p></div></div>
        <div className="card max-w-[560px] p-7">
          <div className="mb-6 rounded border border-[#74303a] bg-[#3a1519] px-5 py-4">
            <strong className="mb-1.5 flex items-center gap-2 text-[#ffb4bd]"><FiAlertTriangle /> This action is permanent</strong>
            <p className="text-sm text-[#ffb4bd]">This cannot be undone. All your data will be erased.</p>
          </div>
          <label className="mb-6 flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            I understand this is permanent
          </label>
          <button className="btn btn-danger px-6 py-2.5" onClick={handle} disabled={!confirmed||loading}><FiTrash2 /> {loading ? "Deleting…" : "Delete my account permanently"}</button>
        </div>
      </div>
    </div>
  );
}
