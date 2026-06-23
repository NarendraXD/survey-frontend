import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "https://survey-backend-pqqt.onrender.com/api";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post(`${API}/auth/register`, form);
      setSuccess("Account created. Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  const inputStyle = (name) => ({
    width: "100%",
    padding: "11px 14px",
    border: `1.5px solid ${focused === name ? "#6366f1" : "#e2e8f0"}`,
    borderRadius: "7px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    background: "#fafafa",
    color: "#0f172a",
    transition: "border-color 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "0 20px" }}>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "6px", height: "24px", background: "#6366f1", borderRadius: "2px" }} />
            <span style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>FormBuilder</span>
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>Create your account</p>
        </div>

        <div style={{ background: "#fff", borderRadius: "12px", padding: "36px 32px", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "10px 14px", borderRadius: "7px", fontSize: "13px", marginBottom: "20px", fontWeight: "500" }}>{error}</div>}
          {success && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d", padding: "10px 14px", borderRadius: "7px", fontSize: "13px", marginBottom: "20px", fontWeight: "500" }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={lbl}>Email address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} required placeholder="you@company.com" style={inputStyle("email")} />
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#94a3b8" }}>Include "admin" in email for admin access</p>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={lbl}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} required placeholder="Min 6 characters" style={inputStyle("password")} />
            </div>
            <button type="submit" style={{ width: "100%", padding: "12px", background: "#0f1117", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.3px" }}>
              Create Account
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#94a3b8" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#6366f1", textDecoration: "none", fontWeight: "700" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const lbl = { display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "6px", letterSpacing: "0.3px", textTransform: "uppercase" };