import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { PasswordInput } from "../../../components/ui/PasswordInput.jsx";
import { FiAlertCircle, FiCpu } from "react-icons/fi";

function parseGoogleProfile(encoded) {
  if (!encoded) return null;
  try {
    const raw = JSON.parse(decodeURIComponent(encoded));
    return {
      googleId: raw.id,
      firstName: raw.name?.givenName || raw.displayName?.split(" ")[0] || "",
      lastName: raw.name?.familyName || raw.displayName?.split(" ").slice(1).join(" ") || "",
      email: raw.emails?.[0]?.value || "",
      picture: raw.photos?.[0]?.value || null,
      displayName: raw.displayName || "",
    };
  } catch {
    return null;
  }
}

export function SetPasswordPage() {
  const { register } = useAuth();
  const { navigate } = useNavigate();

  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const profile = parseGoogleProfile(params.get("user"));

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!profile) navigate("/login");
  }, []);

  if (!profile) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setError(""); setLoading(true);
    try {
      const user = await register({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        picture: profile.picture,
      });
      navigate(user?.isAdmin ? "/dashboard" : "/home");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <p className="auth-hero-tag"><FiCpu /> Complete your account</p>
          <h1 className="auth-hero-title">Set a password<br />for your<br /><em>Google account</em></h1>
          <p className="auth-hero-sub">Choose a password to secure your account. You&apos;ll use it for future logins alongside Google.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-brand"><span className="accent">Osaro</span>Tech</div>
          <h1 className="auth-title">Set password</h1>
          <p className="auth-sub">Welcome, {profile.displayName || profile.email}</p>
          {error && <div className="error-box"><FiAlertCircle /> {error}</div>}
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-surface p-3">
            {profile.picture && (
              <img src={profile.picture} alt="" className="h-10 w-10 rounded-full" />
            )}
            <div>
              <p className="text-sm font-medium">{profile.displayName}</p>
              <p className="text-xs text-ink-muted">{profile.email}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <PasswordInput label="Password" name="password" value={form.password} onChange={set("password")} placeholder="Uppercase, number, and symbol" required />
            <PasswordInput label="Confirm password" name="confirmPassword" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required />
            <button type="submit" className="btn btn-primary btn-lg mt-1 w-full" disabled={loading}>
              {loading ? "Creating account\u2026" : "Set password & create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
