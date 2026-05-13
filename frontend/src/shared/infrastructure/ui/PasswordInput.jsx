import { useState } from "react";

export function PasswordInput({ label, name, value, onChange, placeholder = "••••••••", required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      {label && <label htmlFor={name}>{label}</label>}
      <div style={{ position:"relative" }}>
        <input id={name} type={show ? "text" : "password"} name={name} value={value} onChange={onChange}
          placeholder={placeholder} required={required} className="input" style={{ paddingRight:44 }} />
        <button type="button" onClick={() => setShow((s) => !s)}
          style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--ink-faint)", display:"flex", padding:0 }}
          aria-label={show ? "Hide password" : "Show password"}>
          {show
            ? <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1={1} y1={1} x2={23} y2={23}/></svg>
            : <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx={12} cy={12} r={3}/></svg>
          }
        </button>
      </div>
    </div>
  );
}
