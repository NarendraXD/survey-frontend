/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://survey-backend-pqqt.onrender.com/api";

export default function Survey() {
  const [config, setConfig] = useState({ title: "Survey Form", description: "", fields: [] });
  const [form, setForm] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/survey/config`)
      .then(res => {
        setConfig(res.data);
        const init = {};
        (res.data.fields || []).forEach(f => {
          if (f.type === "checkbox") init[f.name] = [];
          else init[f.name] = "";
        });
        setForm(init);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
      await axios.post(`${API}/survey`, { responseData: form });
      setSubmitted(true);
    } catch {
      setError("Submission failed. Please try again.");
    }
  };

  const renderField = (field) => {
    const baseInput = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box", outline: "none", background: "#fff", transition: "border 0.2s" };

    switch (field.type) {
      case "section":
        return (
          <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "8px" }}>
            {field.label && <p style={{ margin: 0, fontWeight: "700", fontSize: "17px", color: "#333" }}>{field.label}</p>}
          </div>
        );

      case "long_text":
        return <textarea name={field.name} value={form[field.name] || ""} onChange={handleChange} required={field.required} rows={4} placeholder="Your answer" style={{ ...baseInput, resize: "vertical" }} />;

      case "multiple_choice":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {field.options?.map((opt, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 14px", border: `2px solid ${form[field.name] === opt ? "#6750a4" : "#e5e7eb"}`, borderRadius: "8px", background: form[field.name] === opt ? "#f5f3ff" : "#fff", transition: "all 0.15s" }}>
                <input type="radio" name={field.name} value={opt} checked={form[field.name] === opt} onChange={handleChange} required={field.required} style={{ accentColor: "#6750a4" }} />
                <span style={{ fontSize: "15px", color: "#333" }}>{opt}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {field.options?.map((opt, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 14px", border: `2px solid ${(form[field.name] || []).includes(opt) ? "#6750a4" : "#e5e7eb"}`, borderRadius: "8px", background: (form[field.name] || []).includes(opt) ? "#f5f3ff" : "#fff", transition: "all 0.15s" }}>
                <input type="checkbox" checked={(form[field.name] || []).includes(opt)} onChange={e => handleCheckbox(field.name, opt, e.target.checked)} style={{ accentColor: "#6750a4", width: "16px", height: "16px" }} />
                <span style={{ fontSize: "15px", color: "#333" }}>{opt}</span>
              </label>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <select name={field.name} value={form[field.name] || ""} onChange={handleChange} required={field.required} style={{ ...baseInput }}>
            <option value="">Select an option</option>
            {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        );

      case "linear_scale":
        const min = field.scaleMin ?? 1;
        const max = field.scaleMax ?? 5;
        const scale = Array.from({ length: max - min + 1 }, (_, i) => i + min);
        return (
          <div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {scale.map(val => (
                <button key={val} type="button" onClick={() => setForm({ ...form, [field.name]: val })} style={{ width: "44px", height: "44px", borderRadius: "50%", border: `2px solid ${form[field.name] === val ? "#6750a4" : "#d1d5db"}`, background: form[field.name] === val ? "#6750a4" : "#fff", color: form[field.name] === val ? "#fff" : "#333", fontWeight: "700", fontSize: "15px", cursor: "pointer", transition: "all 0.15s" }}>
                  {val}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              <span style={{ fontSize: "12px", color: "#888" }}>{min} = Not likely</span>
              <span style={{ fontSize: "12px", color: "#888" }}>Very likely = {max}</span>
            </div>
          </div>
        );

      case "date":
        return <input type="date" name={field.name} value={form[field.name] || ""} onChange={handleChange} required={field.required} style={baseInput} />;

      case "time":
        return <input type="time" name={field.name} value={form[field.name] || ""} onChange={handleChange} required={field.required} style={baseInput} />;

      case "email":
        return <input type="email" name={field.name} value={form[field.name] || ""} onChange={handleChange} required={field.required} placeholder="example@email.com" style={baseInput} />;

      case "number":
        return <input type="number" name={field.name} value={form[field.name] || ""} onChange={handleChange} required={field.required} placeholder="Enter a number" style={baseInput} />;

      default:
        return <input type="text" name={field.name} value={form[field.name] || ""} onChange={handleChange} required={field.required} placeholder="Your answer" style={baseInput} />;
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <p style={{ color: "#9ca3af", fontSize: "16px" }}>Loading form...</p>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <div style={{ background: "#fff", padding: "56px 48px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: "420px" }}>
        <div style={{ width: "72px", height: "72px", background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "32px" }}>✅</div>
        <h2 style={{ margin: "0 0 8px", color: "#111", fontSize: "24px", fontWeight: "800" }}>Thank you!</h2>
        <p style={{ color: "#6b7280", margin: "0 0 28px", fontSize: "15px" }}>Your response has been recorded successfully.</p>
        <button onClick={() => { setSubmitted(false); const init = {}; config.fields.forEach(f => { if (f.type === "checkbox") init[f.name] = []; else init[f.name] = ""; }); setForm(init); }} style={{ padding: "12px 28px", background: "#6750a4", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "15px" }}>
          Submit Another Response
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif", paddingBottom: "60px" }}>

      {/* Header Card */}
      <div style={{ maxWidth: "680px", margin: "0 auto", paddingTop: "40px", paddingLeft: "20px", paddingRight: "20px" }}>
        <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ height: "10px", background: "linear-gradient(90deg, #6750a4, #9c27b0)" }} />
          <div style={{ padding: "28px 32px" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: "28px", fontWeight: "800", color: "#111" }}>{config.title}</h1>
            {config.description && <p style={{ margin: 0, color: "#555", fontSize: "15px", lineHeight: "1.6" }}>{config.description}</p>}
            <p style={{ margin: "12px 0 0", fontSize: "13px", color: "#ef4444" }}>* Required</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "12px", fontSize: "14px" }}>{error}</div>}

          {config.fields.map((field) => (
            <div key={field.name} style={{ background: "#fff", borderRadius: "12px", padding: field.type === "section" ? "16px 32px" : "24px 32px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              {field.type !== "section" && (
                <label style={{ display: "block", fontSize: "15px", fontWeight: "600", color: "#111", marginBottom: "14px" }}>
                  {field.label}
                  {field.required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
                </label>
              )}
              {renderField(field)}
            </div>
          ))}

          {config.fields.filter(f => f.type !== "section").length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
              <button type="submit" style={{ padding: "13px 36px", background: "#6750a4", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 2px 8px rgba(103,80,164,0.3)" }}>
                Submit
              </button>
              <button type="button" onClick={() => { const init = {}; config.fields.forEach(f => { if (f.type === "checkbox") init[f.name] = []; else init[f.name] = ""; }); setForm(init); }} style={{ background: "none", border: "none", color: "#6750a4", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                Clear form
              </button>
            </div>
          )}
        </form>

        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "12px", color: "#bbb" }}>Powered by SurveyApp</p>
      </div>
    </div>
  );
}