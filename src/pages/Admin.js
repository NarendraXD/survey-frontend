/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://survey-backend-pqqt.onrender.com/api";

const FIELD_TYPES = [
  { value: "short_text", label: "Short Text" },
  { value: "long_text", label: "Paragraph" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "linear_scale", label: "Linear Scale" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "section", label: "── Section Divider" },
];

export default function Admin() {
  const [fields, setFields] = useState([]);
  const [title, setTitle] = useState("Untitled Survey");
  const [description, setDescription] = useState("");
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState("fields");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newField, setNewField] = useState({ label: "", type: "short_text", required: true, options: ["Option 1", "Option 2"], scaleMin: 1, scaleMax: 5 });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email") || "";
  const surveyLink = `${window.location.origin}/survey`;

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchConfig();
    fetchEntries();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API}/survey/config`);
      setFields(res.data.fields || []);
      setTitle(res.data.title || "Untitled Survey");
      setDescription(res.data.description || "");
    } catch { }
  };

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API}/survey`, { headers: { Authorization: `Bearer ${token}` } });
      setEntries(res.data);
    } catch { }
  };

  const saveConfig = async (updatedFields, t, d) => {
    try {
      await axios.post(`${API}/survey/config`, {
        title: t !== undefined ? t : title,
        description: d !== undefined ? d : description,
        fields: updatedFields
      }, { headers: { Authorization: `Bearer ${token}` } });
      showMessage("Saved!");
    } catch {
      setError("Failed to save.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddField = (e) => {
    e.preventDefault();
    if (newField.type !== "section" && !newField.label.trim()) return;
    const name = newField.type === "section"
      ? `section_${Date.now()}`
      : newField.label.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const field = { ...newField, name };
    const updated = [...fields, field];
    setFields(updated);
    saveConfig(updated);
    setNewField({ label: "", type: "short_text", required: true, options: ["Option 1", "Option 2"], scaleMin: 1, scaleMax: 5 });
  };

  const handleDelete = (name) => {
    const updated = fields.filter(f => f.name !== name);
    setFields(updated);
    saveConfig(updated);
  };

  const moveField = (index, direction) => {
    const updated = [...fields];
    const target = index + direction;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setFields(updated);
    saveConfig(updated);
  };

  const updateOption = (fieldIndex, optIndex, value) => {
    const updated = [...fields];
    updated[fieldIndex].options[optIndex] = value;
    setFields(updated);
  };

  const addOption = (fieldIndex) => {
    const updated = [...fields];
    updated[fieldIndex].options.push(`Option ${updated[fieldIndex].options.length + 1}`);
    setFields(updated);
  };

  const removeOption = (fieldIndex, optIndex) => {
    const updated = [...fields];
    updated[fieldIndex].options.splice(optIndex, 1);
    setFields(updated);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const needsOptions = (type) => ["multiple_choice", "checkbox", "dropdown"].includes(type);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Navbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px", fontWeight: "800", color: "#6750a4" }}>📋 SurveyApp</span>
          <span style={{ background: "#ede9fe", color: "#6d28d9", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "700" }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "13px", color: "#888" }}>{email}</span>
          <button onClick={handleLogout} style={{ padding: "8px 18px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Share Banner */}
        <div style={{ background: "linear-gradient(135deg, #6750a4, #9c27b0)", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ margin: 0, fontWeight: "700", color: "#fff", fontSize: "15px" }}>📎 Share Survey Link</p>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#e9d5ff" }}>{surveyLink}</p>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(surveyLink); showMessage("Link copied!"); }} style={{ padding: "10px 20px", background: "#fff", color: "#6750a4", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>
            Copy Link
          </button>
        </div>

        {message && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#16a34a", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>✓ {message}</div>}
        {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", background: "#e5e7eb", padding: "4px", borderRadius: "12px", marginBottom: "24px", width: "fit-content" }}>
          {[{ key: "fields", label: "⚙️ Form Builder" }, { key: "entries", label: `📊 Responses (${entries.length})` }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "9px 22px", background: tab === t.key ? "#fff" : "transparent", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: tab === t.key ? "700" : "500", color: tab === t.key ? "#6750a4" : "#6b7280", fontSize: "14px", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "fields" && (
          <div>
            {/* Survey Title & Description */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "16px", border: "1px solid #e5e7eb", borderTop: "6px solid #6750a4" }}>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => saveConfig(fields, title, description)}
                placeholder="Survey Title"
                style={{ width: "100%", border: "none", borderBottom: "2px solid #e5e7eb", fontSize: "24px", fontWeight: "700", color: "#111", padding: "4px 0", marginBottom: "12px", outline: "none", boxSizing: "border-box" }}
              />
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                onBlur={() => saveConfig(fields, title, description)}
                placeholder="Survey description (optional)"
                style={{ width: "100%", border: "none", borderBottom: "1px solid #e5e7eb", fontSize: "14px", color: "#666", padding: "4px 0", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Fields List */}
            {fields.map((f, i) => (
              <div key={f.name} style={{ background: "#fff", borderRadius: "12px", padding: "20px 24px", marginBottom: "12px", border: "1px solid #e5e7eb", borderLeft: f.type === "section" ? "4px solid #9c27b0" : "4px solid #6750a4" }}>
                {f.type === "section" ? (
                  <div>
                    <p style={{ margin: 0, fontWeight: "700", color: "#6750a4", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>── Section Divider</p>
                    <input
                      value={f.label}
                      onChange={e => { const u = [...fields]; u[i].label = e.target.value; setFields(u); }}
                      onBlur={() => saveConfig(fields)}
                      placeholder="Section title (optional)"
                      style={{ marginTop: "8px", width: "100%", border: "none", borderBottom: "1px solid #eee", fontSize: "16px", fontWeight: "600", color: "#333", padding: "4px 0", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <input
                          value={f.label}
                          onChange={e => { const u = [...fields]; u[i].label = e.target.value; setFields(u); }}
                          onBlur={() => saveConfig(fields)}
                          placeholder="Question"
                          style={{ width: "100%", border: "none", borderBottom: "2px solid #e5e7eb", fontSize: "16px", fontWeight: "600", color: "#111", padding: "4px 0", outline: "none", boxSizing: "border-box" }}
                        />
                        <div style={{ display: "flex", gap: "12px", marginTop: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", background: "#ede9fe", color: "#6d28d9", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
                            {FIELD_TYPES.find(t => t.value === f.type)?.label}
                          </span>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#666", cursor: "pointer" }}>
                            <input type="checkbox" checked={f.required} onChange={e => { const u = [...fields]; u[i].required = e.target.checked; setFields(u); saveConfig([...fields].map((ff, fi) => fi === i ? { ...ff, required: e.target.checked } : ff)); }} />
                            Required
                          </label>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => moveField(i, -1)} style={iconBtn}>↑</button>
                        <button onClick={() => moveField(i, 1)} style={iconBtn}>↓</button>
                        <button onClick={() => handleDelete(f.name)} style={{ ...iconBtn, color: "#dc2626", borderColor: "#fca5a5" }}>✕</button>
                      </div>
                    </div>

                    {needsOptions(f.type) && (
                      <div style={{ marginTop: "12px" }}>
                        {f.options?.map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <span style={{ color: "#aaa", fontSize: "16px" }}>{f.type === "checkbox" ? "☐" : f.type === "dropdown" ? `${oi + 1}.` : "○"}</span>
                            <input
                              value={opt}
                              onChange={e => updateOption(i, oi, e.target.value)}
                              onBlur={() => saveConfig(fields)}
                              style={{ flex: 1, border: "none", borderBottom: "1px solid #e5e7eb", padding: "4px 0", fontSize: "14px", outline: "none" }}
                            />
                            <button onClick={() => { removeOption(i, oi); saveConfig(fields); }} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "16px" }}>✕</button>
                          </div>
                        ))}
                        <button onClick={() => { addOption(i); saveConfig(fields); }} style={{ background: "none", border: "none", color: "#6750a4", cursor: "pointer", fontSize: "13px", fontWeight: "600", padding: "4px 0", marginTop: "4px" }}>
                          + Add option
                        </button>
                      </div>
                    )}

                    {f.type === "linear_scale" && (
                      <div style={{ marginTop: "12px", display: "flex", gap: "16px", alignItems: "center" }}>
                        <div>
                          <label style={{ fontSize: "12px", color: "#888" }}>Min</label>
                          <select value={f.scaleMin} onChange={e => { const u = [...fields]; u[i].scaleMin = Number(e.target.value); setFields(u); saveConfig(u); }} style={selectStyle}>
                            {[0, 1].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", color: "#888" }}>Max</label>
                          <select value={f.scaleMax} onChange={e => { const u = [...fields]; u[i].scaleMax = Number(e.target.value); setFields(u); saveConfig(u); }} style={selectStyle}>
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add Field Form */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "2px dashed #d1d5db", marginTop: "16px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#374151" }}>+ Add New Question</h3>
              <form onSubmit={handleAddField}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={labelStyle}>Question Label</label>
                    <input
                      placeholder="e.g. What is your age?"
                      value={newField.label}
                      onChange={e => setNewField({ ...newField, label: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Question Type</label>
                    <select value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })} style={inputStyle}>
                      {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {needsOptions(newField.type) && (
                  <div style={{ marginBottom: "12px" }}>
                    <label style={labelStyle}>Options</label>
                    {newField.options.map((opt, oi) => (
                      <div key={oi} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                        <input
                          value={opt}
                          onChange={e => { const opts = [...newField.options]; opts[oi] = e.target.value; setNewField({ ...newField, options: opts }); }}
                          style={{ ...inputStyle, marginBottom: 0 }}
                          placeholder={`Option ${oi + 1}`}
                        />
                        <button type="button" onClick={() => setNewField({ ...newField, options: newField.options.filter((_, idx) => idx !== oi) })} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "18px" }}>✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setNewField({ ...newField, options: [...newField.options, `Option ${newField.options.length + 1}`] })} style={{ background: "none", border: "none", color: "#6750a4", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>+ Add option</button>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#555", cursor: "pointer" }}>
                    <input type="checkbox" checked={newField.required} onChange={e => setNewField({ ...newField, required: e.target.checked })} />
                    Required field
                  </label>
                  <button type="submit" style={{ padding: "10px 24px", background: "#6750a4", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>
                    Add Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Entries Tab */}
        {tab === "entries" && (
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111" }}>All Responses</h3>
              <button onClick={fetchEntries} style={{ padding: "7px 16px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>↻ Refresh</button>
            </div>
            {entries.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af" }}>
                <p style={{ fontSize: "32px", margin: "0 0 8px" }}>📭</p>
                <p style={{ margin: 0, fontWeight: "600" }}>No responses yet</p>
              </div>
            ) : (
              entries.map((entry, i) => (
                <div key={entry._id} style={{ padding: "20px 24px", borderBottom: i < entries.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#6750a4" }}>Response #{entries.length - i}</span>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                    {entry.responseData && Object.entries(entry.responseData).map(([key, val]) => (
                      <div key={key} style={{ background: "#f9fafb", padding: "10px 14px", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
                        <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", textTransform: "capitalize", fontWeight: "600" }}>{key.replace(/_\d+$/,"").replace(/_/g, " ")}</p>
                        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#111", fontWeight: "500" }}>{Array.isArray(val) ? val.join(", ") : String(val)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const iconBtn = { padding: "6px 10px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "700", color: "#374151" };
const labelStyle = { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", background: "#fff" };
const selectStyle = { padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", marginLeft: "8px" };