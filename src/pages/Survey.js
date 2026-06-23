/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://survey-backend-pqqt.onrender.com/api";

export default function Survey() {
  const [config, setConfig] = useState({ title: "Survey", description: "", fields: [] });
  const [form, setForm] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(null);

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
      setError("Submission failed. Please check your connection and try again.");
    }
  };

  const inputBase = (name) => ({
    width: "100%",
    padding: "11px 14px",
    border: `1.5px solid ${focused === name ? "#6366f1" : "#e2e8f0"}`,
    borderRadius: "7px",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
    background: "#fff",
    color: "#0f172a",
    transition: "border-color 0.15s",
  });

  const renderField = (field) => {
    switch (field.type) {
      case "section":
        return (
          <div style={{ paddingBottom: "4px" }}>
            {field.label && <p style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>{field.label}</p>}
            <div style={{ height: "1px", background: "#e2e8f0", marginTop: "10px" }} />
          </div>
        );

      case "long_text":
        return (
          <textarea
            name={field.name}
            value={form[field.name] || ""}
            onChange={handleChange}
            onFocus={() => setFocused(field.name)}
            onBlur={() => setFocused(null)}
            required={field.required}
            rows={4}
            placeholder="Type your answer here..."
            style={{ ...inputBase(field.name), resize: "vertical" }}
          />
        );

      case "multiple_choice":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {field.options?.map((opt, i) => {
              const selected = form[field.name] === opt;
              return (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: `1.5px solid ${selected ? "#6366f1" : "#e2e8f0"}`, borderRadius: "8px", background: selected ? "#eef2ff" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${selected ? "#6366f1" : "#cbd5e1"}`, background: selected ? "#6366f1" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                    {selected && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <input type="radio" name={field.name} value={opt} checked={selected} onChange={handleChange} style={{ display: "none" }} />
                  <span style={{ fontSize: "14px", color: selected ? "#4338ca" : "#374151", fontWeight: selected ? "600" : "400" }}>{opt}</span>
                </label>
              );
            })}
          </div>
        );

      case "checkbox":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {field.options?.map((opt, i) => {
              const checked = (form[field.name] || []).includes(opt);
              return (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: `1.5px solid ${checked ? "#6366f1" : "#e2e8f0"}`, borderRadius: "8px", background: checked ? "#eef2ff" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${checked ? "#6366f1" : "#cbd5e1"}`, background: checked ? "#6366f1" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                    {checked && <span style={{ color: "#fff", fontSize: "12px", fontWeight: "800", lineHeight: 1 }}>✓</span>}
                  </div>
                  <input type="checkbox" checked={checked} onChange={e => handleCheckbox(field.name, opt, e.target.checked)} style={{ display: "none" }} />
                  <span style={{ fontSize: "14px", color: checked ? "#4338ca" : "#374151", fontWeight: checked ? "600" : "400" }}>{opt}</span>
                </label>
              );
            })}
          </div>
        );

      case "dropdown":
        return (
          <select
            name={field.name}
            value={form[field.name] || ""}
            onChange={handleChange}
            required={field.required}
            style={{ ...inputBase(field.name), background: "#fff" }}
          >
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
              {scale.map(val => {
                const selected = form[field.name] === val;
                return (
                  <button key={val} type="button" onClick={() => setForm({ ...form, [field.name]: val })} style={{ width: "46px", height: "46px", borderRadius: "8px", border: `1.5px solid ${selected ? "#6366f1" : "#e2e8f0"}`, background: selected ? "#6366f1" : "#fff", color: selected ? "#fff" : "#374151", fontWeight: "700", fontSize: "15px", cursor: "pointer", transition: "all 0.15s" }}>
                    {val}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>Not likely</span>
              <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>Very likely</span>
            </div>
          </div>
        );

      case "date":
        return <input type="date" name={field.name} value={form[field.name] || ""} onChange={handleChange} onFocus={() => setFocused(field.name)} onBlur={() => setFocused(null)} required={field.required} style={inputBase(field.name)} />;

      case "time":
        return <input type="time" name={field.name} value={form[field.name] || ""} onChange={handleChange} onFocus={() => setFocused(field.name)} onBlur={() => setFocused(null)} required={field.required} style={inputBase(field.name)} />;

      case "email":
        return <input type="email" name={field.name} value={form[field.name] || ""} onChange={handleChange} onFocus={() => setFocused(field.name)} onBlur={() => setFocused(null)} required={field.required} placeholder="example@email.com" style={inputBase(field.name)} />;

      case "number":
        return <input type="number" name={field.name} value={form[field.name] || ""} onChange={handleChange} onFocus={() => setFocused(field.name)} onBlur={() => setFocused(null)} required={field.required} placeholder="Enter a number" style={inputBase(field.name)} />;

      default:
        return <input type="text" name={field.name} value={form[field.name] || ""} onChange={handleChange} onFocus={() => setFocused(field.name)} onBlur={() => setFocused(null)} required={field.required} placeholder="Your answer" style={inputBase(field.name)} />;
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, system-ui, sans-serif", background: "#f4f5f7" }}>
      <p style={{ color: "#94a3b8", fontSize: "15px", fontWeight: "500" }}>Loading...</p>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <div style={{ background: "#fff", padding: "64px 56px", borderRadius: "12px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", maxWidth: "440px", border: "1px solid #e5e7eb" }}>
        <div style={{ width: "64px", height: "64px", background: "#eef2ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <div style={{ width: "28px", height: "28px", border: "3px solid #6366f1", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#6366f1", fontSize: "14px", fontWeight: "800" }}>✓</span>
          </div>
        </div>
        <h2 style={{ margin: "0 0 10px", color: "#0f172a", fontSize: "22px", fontWeight: "800" }}>Response Recorded</h2>
        <p style={{ color: "#64748b", margin: "0 0 32px", fontSize: "15px", lineHeight: "1.6" }}>Thank you for completing this survey. Your response has been saved successfully.</p>
        <button onClick={() => { setSubmitted(false); const init = {}; config.fields.forEach(f => { if (f.type === "checkbox") init[f.name] = []; else init[f.name] = ""; }); setForm(init); }} style={{ padding: "11px 28px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>
          Submit Another Response
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: "80px" }}>

      {/* Top bar */}
      <div style={{ background: "#0f1117", height: "4px", width: "100%" }} />
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: "52px", display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", letterSpacing: "0.2px" }}>FormBuilder</span>
        <span style={{ margin: "0 10px", color: "#e2e8f0" }}>/</span>
        <span style={{ fontSize: "14px", color: "#64748b" }}>{config.title}</span>
      </div>

      <div style={{ maxWidth: "660px", margin: "0 auto", padding: "40px 20px" }}>

        {/* Title card */}
        <div style={{ background: "#fff", borderRadius: "10px", padding: "32px 36px", marginBottom: "14px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", borderTop: "4px solid #6366f1" }}>
          <h1 style={{ margin: "0 0 10px", fontSize: "26px", fontWeight: "800", color: "#0f172a", lineHeight: "1.3" }}>{config.title}</h1>
          {config.description && <p style={{ margin: 0, color: "#64748b", fontSize: "15px", lineHeight: "1.7" }}>{config.description}</p>}
          <div style={{ marginTop: "16px", padding: "10px 14px", background: "#fef9ec", border: "1px solid #fde68a", borderRadius: "6px" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#92400e", fontWeight: "600" }}>Fields marked with <span style={{ color: "#dc2626" }}>*</span> are required.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "14px", fontSize: "14px", fontWeight: "500" }}>{error}</div>}

          {config.fields.map((field) => (
            <div key={field.name} style={{ background: field.type === "section" ? "transparent" : "#fff", borderRadius: "10px", padding: field.type === "section" ? "8px 0" : "24px 36px", marginBottom: "12px", border: field.type === "section" ? "none" : "1px solid #e5e7eb", boxShadow: field.type === "section" ? "none" : "0 1px 4px rgba(0,0,0,0.04)" }}>
              {field.type !== "section" && (
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "12px", lineHeight: "1.5" }}>
                  {field.label}
                  {field.required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}
                </label>
              )}
              {renderField(field)}
            </div>
          ))}

          {config.fields.filter(f => f.type !== "section").length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <button type="submit" style={{ padding: "12px 36px", background: "#0f1117", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.3px" }}>
                Submit Response
              </button>
              <button type="button" onClick={() => { const init = {}; config.fields.forEach(f => { if (f.type === "checkbox") init[f.name] = []; else init[f.name] = ""; }); setForm(init); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                Clear all
              </button>
            </div>
          )}
        </form>

        <p style={{ textAlign: "center", marginTop: "40px", fontSize: "12px", color: "#cbd5e1", letterSpacing: "0.5px" }}>POWERED BY FORMBUILDER</p>
      </div>
    </div>
  );
}