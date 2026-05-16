import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { PasswordInput } from "../../../components/ui/PasswordInput.jsx";
import { Link } from "../../../components/ui/Link.jsx";
import { FiAlertCircle, FiCpu } from "react-icons/fi";

export function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setError(""); setLoading(true);
    try {
      const user = await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate(user?.isAdmin ? "/dashboard" : "/home");
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="field"><label>First name</label><input className="input" placeholder="John" value={form.firstName} onChange={set("firstName")} required /></div>
              <div className="field"><label>Last name</label><input className="input" placeholder="Doe" value={form.lastName} onChange={set("lastName")} required /></div>
            </div>
            <div className="field"><label>Email address</label><input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set("email")} required /></div>
            <PasswordInput label="Password" name="password" value={form.password} onChange={set("password")} placeholder="Uppercase, number, and symbol" required />
            <PasswordInput label="Confirm password" name="confirmPassword" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required />
            <button type="submit" className="btn btn-primary btn-lg mt-1 w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="auth-footer">Already have an account? <Link to="/login" className="accent-link">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
