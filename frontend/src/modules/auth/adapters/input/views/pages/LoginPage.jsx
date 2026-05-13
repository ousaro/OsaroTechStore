import { useState } from "react";
import { useAuth } from "../useAuthModule.js";
import { useNavigate } from "../../../../../../shared/hooks/useNavigate.js";
import { PasswordInput } from "../../../../../../shared/infrastructure/ui/PasswordInput.jsx";
import { Link } from "../../../../../../shared/infrastructure/ui/Link.jsx";
import { env } from "../../../../../../infrastructure/config/env.js";
import { FiAlertCircle, FiCpu } from "react-icons/fi";

export function LoginPage() {
  const { login } = useAuth();
  const { navigate } = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <p className="auth-hero-tag"><FiCpu /> OsaroTech Store</p>
          <h1 className="auth-hero-title">Your next tech<br /><em>upgrade</em> is<br />one click away</h1>
          <p className="auth-hero-sub">Premium devices, exclusive deals, and fast delivery. Join thousands of happy customers.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-brand"><span className="accent">Osaro</span>Tech</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your account to continue</p>
          {error && <div className="error-box"><FiAlertCircle /> {error}</div>}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div className="field">
              <label>Email address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set("email")} required autoComplete="email" />
            </div>
            <PasswordInput label="Password" name="password" value={form.password} onChange={set("password")} required />
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:"100%", justifyContent:"center", marginTop:4 }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <div className="auth-divider">or continue with</div>
          <a href={env.googleAuthUrl} className="google-btn">
            <svg style={{ width:18, height:18 }} viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </a>
          <p className="auth-footer">Don't have an account? <Link to="/register" className="accent-link">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
