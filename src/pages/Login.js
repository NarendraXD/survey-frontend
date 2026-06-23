import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "https://survey-backend-pqqt.onrender.com/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.email || form.email);
      const isAdmin = (res.data.email || form.email).toLowerCase().includes("admin");
      navigate(isAdmin ? "/admin" : "/survey");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Survey App</h1>
        <p style={subtitleStyle}>Sign in to your account</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          <button type="submit" style={btnStyle}>Sign In</button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#666", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: "600" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, Arial, sans-serif" };
const cardStyle = { background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", width: "100%", maxWidth: "420px" };
const titleStyle = { margin: "0 0 4px", fontSize: "24px", fontWeight: "700", color: "#111", textAlign: "center" };
const subtitleStyle = { margin: "0 0 28px", color: "#666", fontSize: "14px", textAlign: "center" };
const fieldStyle = { marginBottom: "16px" };
const labelStyle = { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#374151" };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none" };
const btnStyle = { width: "100%", padding: "11px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "8px" };
const errorStyle = { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" };