/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Lets us read the URL ID

const API = "https://survey-backend-pqqt.onrender.com/api";

export default function Survey() {
  const { id } = useParams(); // Gets the unique ID from the link
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [form, setForm] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    // Fetch the specific survey without any tokens
    axios.get(`${API}/survey/${id}`)
      .then(res => {
        setActiveSurvey(res.data);
        const init = {};
        (res.data.fields || []).forEach(f => {
          if (f.type === "checkbox") init[f.name] = [];
          else init[f.name] = "";
        });
        setForm(init);
        setLoading(false);
      })
      .catch(() => {
        setError("Survey not found or link is invalid.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckbox = (name, value, checked) => {
    const current = form[name] || [];
    if (checked) setForm({ ...form, [name]: [...current, value] });
    else setForm({ ...form, [name]: current.filter(v => v !== value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Submit without a token
      await axios.post(`${API}/survey/${id}/submit`, { responseData: form });
      setSubmitted(true);
    } catch {
      setError("Submission failed. Please check your connection and try again.");
    }
  };

  const inputBase = (name) => ({ width: "100%", padding: "11px 14px", border: `1.5px solid ${focused === name ? "#6366f1" : "#e2e8f0"}`, borderRadius: "7px", fontSize: "15px", boxSizing: "border-box", outline: "none", background: "#fff", color: "#0f172a", transition: "border-color 0.15s" });

  const renderField = (field) => {
    switch (field.type) {
      case "section":
        return <div style={{ paddingBottom: "4px" }}>{field.label && <p style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>{field.label}</p>}<div style={{ height: "1px", background: "#e2e8f0", marginTop: "10px" }} /></div>;
      case "long_text":
        return <textarea name={field.name} value={form[field.name] || ""} onChange={handleChange} onFocus={() => setFocused(field.name)} onBlur={() => setFocused(null)} required={field.required} rows={4} placeholder="Type your answer here..." style={{ ...inputBase(field.name), resize: "vertical" }} />;
      case "multiple_choice":
        return <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{field.options?.map((opt, i) => { const selected = form[field.name] === opt; return <label key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: `1.5px solid ${selected ? "#6366f1" : "#e2e8f0"}`, borderRadius: "8px", background: selected ? "#eef2ff" : "#fff", cursor: "pointer" }}><input type="radio" name={field.name} value={opt} checked={selected} onChange={handleChange} style={{ display: "none" }} /><span style={{ fontSize: "14px", color: selected ? "#4338ca" : "#374151", fontWeight: selected ? "600" : "400" }}>{opt}</span></label>; })}</div>;
      case "checkbox":
        return <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{field.options?.map((opt, i) => { const checked = (form[field.name] || []).includes(opt); return <label key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: `1.5px solid ${checked ? "#6366f1" : "#e2e8f0"}`, borderRadius: "8px", background: checked ? "#eef2ff" : "#fff", cursor: "pointer" }}><input type="checkbox" checked={checked} onChange={e => handleCheckbox(field.name, opt, e.target.checked)} style={{ display: "none" }} /><span style={{ fontSize: "14px", color: checked ? "#4338ca" : "#374151", fontWeight: checked ? "600" : "400" }}>{opt}</span></label>; })}</div>;
      default:
        return <input type="text" name={field.name} value={form[field.name] || ""} onChange={handleChange} onFocus={() => setFocused(field.name)} onBlur={() => setFocused(null)} required={field.required} placeholder="Your answer" style={inputBase(field.name)} />;
    }
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f5f7" }}><p>Loading...</p></div>;
  
  if (!activeSurvey && error) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f5f7" }}><p style={{ color: "red" }}>{error}</p></div>;

  if (submitted || activeSurvey.isCompleted) return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <div style={{ background: "#fff", padding: "64px 56px", borderRadius: "12px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
        <h2 style={{ margin: "0 0 10px", color: "#0f172a", fontSize: "22px", fontWeight: "800" }}>Thank You!</h2>
        <p style={{ color: "#64748b", margin: "0", fontSize: "15px" }}>This survey has been completed and recorded.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: "80px", paddingTop: "40px" }}>
      <div style={{ maxWidth: "660px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ background: "#fff", borderRadius: "10px", padding: "32px 36px", marginBottom: "14px", border: "1px solid #e5e7eb", borderTop: "4px solid #6366f1" }}>
          <h1 style={{ margin: "0 0 10px", fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>{activeSurvey.title}</h1>
          {activeSurvey.description && <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>{activeSurvey.description}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "14px", fontSize: "14px" }}>{error}</div>}

          {activeSurvey.fields.map((field) => (
            <div key={field.name} style={{ background: field.type === "section" ? "transparent" : "#fff", borderRadius: "10px", padding: field.type === "section" ? "8px 0" : "24px 36px", marginBottom: "12px", border: field.type === "section" ? "none" : "1px solid #e5e7eb" }}>
              {field.type !== "section" && <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "12px" }}>{field.label}{field.required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}</label>}
              {renderField(field)}
            </div>
          ))}
          <button type="submit" style={{ padding: "12px 36px", background: "#0f1117", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "20px" }}>Submit Response</button>
        </form>
      </div>
    </div>
  );
}