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
          <div className="card" style={{ padding:28 }}>
            <div style={{ display:"flex", gap:20, alignItems:"center", marginBottom:28 }}>
              <img src={form.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName||"U")}&background=ff4d5e&color=11131b&size=80`} alt="" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"3px solid var(--border)" }} />
              <div>
                <div style={{ fontSize:20, fontWeight:700 }}>{profile?.fullName}</div>
                <div style={{ fontSize:14, color:"var(--ink-muted)" }}>{profile?.email}</div>
                {profile?.isAdmin && <span className="admin-tag" style={{ display:"inline-block", marginTop:6 }}>Admin</span>}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div className="field"><label>First name</label><input className="input" value={form.firstName} onChange={set("firstName")} readOnly={!editing} required /></div>
              <div className="field"><label>Last name</label><input className="input" value={form.lastName} onChange={set("lastName")} readOnly={!editing} required /></div>
              <div className="field"><label>Email</label><input type="email" className="input" value={form.email} onChange={set("email")} readOnly={!editing} required /></div>
              <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={set("phone")} readOnly={!editing} placeholder="+212 600 000 000" /></div>
              {editing && <div className="field" style={{ gridColumn:"1 / -1" }}><label>Picture URL</label><input className="input" value={form.picture} onChange={set("picture")} placeholder="https://…" /></div>}
            </div>
            {editing && (
              <div style={{ display:"flex", gap:10, marginTop:20 }}>
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
          <div className="card" style={{ padding:28 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div className="field" style={{ gridColumn:"1 / -1" }}><label>Street address</label><input className="input" placeholder="123 Main Street" value={form.address} onChange={set("address")} /></div>
              <div className="field"><label>City</label><input className="input" placeholder="Casablanca" value={form.city} onChange={set("city")} /></div>
              <div className="field"><label>State / Region</label><input className="input" placeholder="Grand Casablanca" value={form.state} onChange={set("state")} /></div>
              <div className="field"><label>Postal code</label><input className="input" placeholder="20000" value={form.postalCode} onChange={set("postalCode")} /></div>
              <div className="field"><label>Country</label><input className="input" placeholder="Morocco" value={form.country} onChange={set("country")} /></div>
            </div>
            <div style={{ marginTop:20 }}><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving…" : "Save address"}</button></div>
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
        <div className="card" style={{ padding:28, maxWidth:480 }}>
          <div className="info-box" style={{ marginBottom:20 }}><FiInfo /> Password update is not yet exposed in API v1.0.0.</div>
          <div style={{ display:"flex", flexDirection:"column", gap:16, opacity:.5, pointerEvents:"none" }}>
            <PasswordInput label="Current password" name="cur" value="" onChange={() => {}} />
            <PasswordInput label="New password"     name="new" value="" onChange={() => {}} />
            <PasswordInput label="Confirm"          name="con" value="" onChange={() => {}} />
          </div>
          <button className="btn btn-primary" style={{ marginTop:20 }} disabled>Change password</button>
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
        <div className="page-header"><div><h1 className="page-title" style={{ color:"var(--accent)" }}>Delete account</h1><p className="page-subtitle">Permanently remove your account</p></div></div>
        <div className="card" style={{ padding:28, maxWidth:560 }}>
          <div style={{ background:"#3a1519", border:"1px solid #74303a", borderRadius:"var(--radius)", padding:"16px 20px", marginBottom:24 }}>
            <strong style={{ color:"#ffb4bd", display:"flex", gap:8, alignItems:"center", marginBottom:6 }}><FiAlertTriangle /> This action is permanent</strong>
            <p style={{ fontSize:14, color:"#ffb4bd" }}>This cannot be undone. All your data will be erased.</p>
          </div>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:24, fontSize:14 }}>
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            I understand this is permanent
          </label>
          <button className="btn btn-danger" style={{ padding:"10px 24px" }} onClick={handle} disabled={!confirmed||loading}><FiTrash2 /> {loading ? "Deleting…" : "Delete my account permanently"}</button>
        </div>
      </div>
    </div>
  );
}
