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
  { value: "section", label: "Section Divider" },
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
      showMessage("Changes saved");
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
    <div style={{ minHeight: "100vh", background: "#f4f5f7", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Navbar */}
      <div style={{ background: "#0f1117", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "8px", height: "28px", background: "#6366f1", borderRadius: "2px" }} />
          <span style={{ fontSize: "17px", fontWeight: "700", color: "#fff", letterSpacing: "0.3px" }}>FormBuilder</span>
          <span style={{ background: "#1e1f2e", color: "#818cf8", fontSize: "11px", padding: "3px 10px", borderRadius: "4px", fontWeight: "700", letterSpacing: "1px" }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "13px", color: "#6b7280" }}>{email}</span>
          <button onClick={handleLogout} style={{ padding: "7px 16px", background: "transparent", border: "1px solid #374151", borderRadius: "6px", cursor: "pointer", fontSize: "13px", color: "#9ca3af", fontWeight: "600" }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "36px 24px" }}>

        {/* Share Banner */}
        <div style={{ background: "#0f1117", borderRadius: "10px", padding: "18px 24px", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", border: "1px solid #1e293b" }}>
          <div>
            <p style={{ margin: 0, fontWeight: "600", color: "#e2e8f0", fontSize: "13px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Survey Link</p>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6366f1", fontFamily: "monospace" }}>{surveyLink}</p>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(surveyLink); showMessage("Link copied to clipboard"); }} style={{ padding: "9px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "700", fontSize: "13px", letterSpacing: "0.3px" }}>
            Copy Link
          </button>
        </div>

        {message && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d", padding: "11px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600" }}>{message}</div>}
        {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "11px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>{error}</div>}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: "28px", gap: "0" }}>
          {[{ key: "fields", label: "Form Builder" }, { key: "entries", label: `Responses  ${entries.length}` }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "12px 24px", background: "transparent", border: "none", borderBottom: tab === t.key ? "2px solid #6366f1" : "2px solid transparent", marginBottom: "-2px", cursor: "pointer", fontWeight: tab === t.key ? "700" : "500", color: tab === t.key ? "#6366f1" : "#6b7280", fontSize: "14px", letterSpacing: "0.2px" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "fields" && (
          <div>
            {/* Title Card */}
            <div style={{ background: "#fff", borderRadius: "10px", padding: "28px 32px", marginBottom: "16px", border: "1px solid #e5e7eb", borderLeft: "4px solid #6366f1" }}>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => saveConfig(fields, title, description)}
                placeholder="Survey Title"
                style={{ width: "100%", border: "none", fontSize: "22px", fontWeight: "800", color: "#0f172a", padding: "0 0 8px", outline: "none", boxSizing: "border-box", borderBottom: "2px solid #f1f5f9" }}
              />
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                onBlur={() => saveConfig(fields, title, description)}
                placeholder="Add a description..."
                style={{ width: "100%", border: "none", fontSize: "14px", color: "#64748b", padding: "8px 0 0", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Fields */}
            {fields.map((f, i) => (
              <div key={f.name} style={{ background: "#fff", borderRadius: "10px", padding: "22px 28px", marginBottom: "10px", border: "1px solid #e5e7eb", borderLeft: f.type === "section" ? "4px solid #94a3b8" : "4px solid #6366f1" }}>
                {f.type === "section" ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: "800", color: "#94a3b8", letterSpacing: "2px", textTransform: "uppercase" }}>Section</p>
                      <input value={f.label} onChange={e => { const u = [...fields]; u[i].label = e.target.value; setFields(u); }} onBlur={() => saveConfig(fields)} placeholder="Section title" style={{ border: "none", fontSize: "16px", fontWeight: "700", color: "#0f172a", outline: "none", width: "100%" }} />
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => moveField(i, -1)} style={iconBtn}>↑</button>
                      <button onClick={() => moveField(i, 1)} style={iconBtn}>↓</button>
                      <button onClick={() => handleDelete(f.name)} style={{ ...iconBtn, color: "#dc2626", borderColor: "#fecaca" }}>✕</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <input value={f.label} onChange={e => { const u = [...fields]; u[i].label = e.target.value; setFields(u); }} onBlur={() => saveConfig(fields)} placeholder="Question" style={{ width: "100%", border: "none", borderBottom: "2px solid #f1f5f9", fontSize: "15px", fontWeight: "600", color: "#0f172a", padding: "0 0 8px", outline: "none", boxSizing: "border-box" }} />
                        <div style={{ display: "flex", gap: "12px", marginTop: "10px", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", background: "#eef2ff", color: "#6366f1", padding: "3px 10px", borderRadius: "4px", fontWeight: "700", letterSpacing: "0.5px" }}>
                            {FIELD_TYPES.find(t => t.value === f.type)?.label?.toUpperCase()}
                          </span>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b", cursor: "pointer" }}>
                            <input type="checkbox" checked={f.required} onChange={e => { const u = [...fields].map((ff, fi) => fi === i ? { ...ff, required: e.target.checked } : ff); setFields(u); saveConfig(u); }} style={{ accentColor: "#6366f1" }} />
                            Required
                          </label>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => moveField(i, -1)} style={iconBtn}>↑</button>
                        <button onClick={() => moveField(i, 1)} style={iconBtn}>↓</button>
                        <button onClick={() => handleDelete(f.name)} style={{ ...iconBtn, color: "#dc2626", borderColor: "#fecaca" }}>✕</button>
                      </div>
                    </div>

                    {needsOptions(f.type) && (
                      <div style={{ marginTop: "16px", paddingLeft: "4px" }}>
                        {f.options?.map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            <div style={{ width: "16px", height: "16px", borderRadius: f.type === "checkbox" ? "3px" : "50%", border: "2px solid #cbd5e1", flexShrink: 0 }} />
                            <input value={opt} onChange={e => updateOption(i, oi, e.target.value)} onBlur={() => saveConfig(fields)} style={{ flex: 1, border: "none", borderBottom: "1px solid #f1f5f9", padding: "4px 0", fontSize: "14px", color: "#374151", outline: "none" }} />
                            <button onClick={() => { removeOption(i, oi); saveConfig(fields); }} style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>✕</button>
                          </div>
                        ))}
                        <button onClick={() => { addOption(i); }} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "13px", fontWeight: "600", padding: "4px 0", marginTop: "4px" }}>+ Add option</button>
                      </div>
                    )}

                    {f.type === "linear_scale" && (
                      <div style={{ marginTop: "14px", display: "flex", gap: "20px", alignItems: "center" }}>
                        <div>
                          <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>MIN</label>
                          <select value={f.scaleMin} onChange={e => { const u = [...fields]; u[i].scaleMin = Number(e.target.value); setFields(u); saveConfig(u); }} style={selectSt}>
                            {[0, 1].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>MAX</label>
                          <select value={f.scaleMax} onChange={e => { const u = [...fields]; u[i].scaleMax = Number(e.target.value); setFields(u); saveConfig(u); }} style={selectSt}>
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add Field */}
            <div style={{ background: "#fff", borderRadius: "10px", padding: "24px 28px", border: "1px dashed #cbd5e1", marginTop: "16px" }}>
              <p style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "700", color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase" }}>Add Question</p>
              <form onSubmit={handleAddField}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={lbl}>Question Label</label>
                    <input placeholder="e.g. What is your age?" value={newField.label} onChange={e => setNewField({ ...newField, label: e.target.value })} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Type</label>
                    <select value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })} style={inp}>
                      {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {needsOptions(newField.type) && (
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>Options</label>
                    {newField.options.map((opt, oi) => (
                      <div key={oi} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                        <input value={opt} onChange={e => { const opts = [...newField.options]; opts[oi] = e.target.value; setNewField({ ...newField, options: opts }); }} style={{ ...inp, marginBottom: 0 }} placeholder={`Option ${oi + 1}`} />
                        <button type="button" onClick={() => setNewField({ ...newField, options: newField.options.filter((_, idx) => idx !== oi) })} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "18px" }}>✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setNewField({ ...newField, options: [...newField.options, `Option ${newField.options.length + 1}`] })} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>+ Add option</button>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b", cursor: "pointer" }}>
                    <input type="checkbox" checked={newField.required} onChange={e => setNewField({ ...newField, required: e.target.checked })} style={{ accentColor: "#6366f1" }} />
                    Mark as required
                  </label>
                  <button type="submit" style={{ padding: "10px 24px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>
                    Add Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Responses Tab */}
        {tab === "entries" && (
          <div>
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>All Responses</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>{entries.length} total submissions</p>
                </div>
                <button onClick={fetchEntries} style={{ padding: "8px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "7px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#475569" }}>Refresh</button>
              </div>
              {entries.length === 0 ? (
                <div style={{ padding: "80px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", fontWeight: "500" }}>No responses submitted yet.</p>
                </div>
              ) : (
                entries.map((entry, i) => (
                  <div key={entry._id} style={{ padding: "20px 24px", borderBottom: i < entries.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#6366f1", letterSpacing: "0.5px" }}>RESPONSE #{entries.length - i}</span>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                      {entry.responseData && Object.entries(entry.responseData).map(([key, val]) => (
                        <div key={key} style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                          <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>{key.replace(/_\d+$/, "").replace(/_/g, " ")}</p>
                          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#0f172a", fontWeight: "500" }}>{Array.isArray(val) ? val.join(", ") : String(val)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const iconBtn = { padding: "6px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "700", color: "#475569" };
const lbl = { display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "6px", letterSpacing: "0.3px", textTransform: "uppercase" };
const inp = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "14px", boxSizing: "border-box", background: "#fafafa", color: "#0f172a", outline: "none" };
const selectSt = { padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "14px", marginLeft: "8px", background: "#fafafa" };