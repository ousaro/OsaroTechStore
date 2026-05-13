import { useState } from "react";
import { useAuth } from "../useAuthModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { PasswordInput } from "../../../../../../shared/infrastructure/ui/PasswordInput.jsx";
import { Link } from "../../../../../../shared/infrastructure/ui/Link.jsx";
import { FiAlertCircle, FiCpu } from "react-icons/fi";

export function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useNavigate();
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", password:"", confirm:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    setError(""); setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
      navigate("/home");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <p className="auth-hero-tag"><FiCpu /> Join OsaroTech</p>
          <h1 className="auth-hero-title">Start your<br /><em>tech journey</em><br />today</h1>
          <p className="auth-hero-sub">Create an account and get access to exclusive deals, order tracking, and personalized recommendations.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-brand"><span className="accent">Osaro</span>Tech</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Let's get you set up</p>
          {error && <div className="error-box"><FiAlertCircle /> {error}</div>}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div className="field"><label>First name</label><input className="input" placeholder="John" value={form.firstName} onChange={set("firstName")} required /></div>
              <div className="field"><label>Last name</label><input className="input" placeholder="Doe" value={form.lastName} onChange={set("lastName")} required /></div>
            </div>
            <div className="field"><label>Email address</label><input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set("email")} required /></div>
            <PasswordInput label="Password" name="password" value={form.password} onChange={set("password")} placeholder="At least 8 characters" required />
            <PasswordInput label="Confirm password" name="confirm" value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" required />
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:"100%", justifyContent:"center", marginTop:4 }}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="auth-footer">Already have an account? <Link to="/login" className="accent-link">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
