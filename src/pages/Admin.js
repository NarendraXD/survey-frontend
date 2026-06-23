/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// NEW: Import professional icons!
import { 
  LayoutDashboard, CheckCircle, Clock, PenSquare, LogOut, 
  Search, Bell, FileText, Pencil, Link as LinkIcon, Eye, Plus, ChevronUp, ChevronDown, X 
} from "lucide-react";

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
  const [view, setView] = useState("dashboard");
  const [filterStatus, setFilterStatus] = useState("all"); 
  
  const [entries, setEntries] = useState([]);
  const [fields, setFields] = useState([]);
  const [title, setTitle] = useState("Untitled Survey");
  const [description, setDescription] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  
  const [viewingResponse, setViewingResponse] = useState(null); 
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newField, setNewField] = useState({ label: "", type: "short_text", required: true, options: ["Option 1", "Option 2"], scaleMin: 1, scaleMax: 5 });
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email") || "";

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchEntries();
  }, [view]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API}/survey/all`, { headers: { Authorization: `Bearer ${token}` } });
      setEntries(res.data);
    } catch { }
  };

  const handleEditClick = (entry) => {
    setEditingId(entry._id);
    setTitle(entry.title);
    setDescription(entry.description || "");
    setFields(entry.fields || []);
    setTargetEmail(entry.assignedTo);
    setView("builder");
    window.scrollTo(0, 0);
  };

  const clearBuilder = () => {
    setEditingId(null);
    setFields([]);
    setTitle("Untitled Survey");
    setDescription("");
    setTargetEmail("");
  };

  const handleSendSurvey = async () => {
    if (!targetEmail) { setError("Please specify an email."); setTimeout(() => setError(""), 3000); return; }
    if (fields.length === 0) { setError("Please add at least one question."); setTimeout(() => setError(""), 3000); return; }

    try {
      const payload = { title, description, fields, assignedTo: targetEmail, adminEmail: email };
      if (editingId) {
        await axios.put(`${API}/survey/edit/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        showMessage(`Survey updated for ${targetEmail}`);
      } else {
        await axios.post(`${API}/survey/create`, payload, { headers: { Authorization: `Bearer ${token}` } });
        showMessage(`Survey sent successfully to ${targetEmail}`);
      }
      clearBuilder();
      setView("dashboard");
      setFilterStatus("all"); 
      fetchEntries();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process survey.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const handleAddField = (e) => {
    e.preventDefault();
    if (newField.type !== "section" && !newField.label.trim()) return;
    const name = newField.type === "section" ? `section_${Date.now()}` : newField.label.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const field = { ...newField, name };
    setFields([...fields, field]);
    setNewField({ label: "", type: "short_text", required: true, options: ["Option 1", "Option 2"], scaleMin: 1, scaleMax: 5 });
  };

  const handleDelete = (name) => setFields(fields.filter(f => f.name !== name));
  const moveField = (index, direction) => {
    const updated = [...fields]; const target = index + direction;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setFields(updated);
  };

  const updateOption = (fieldIndex, optIndex, value) => { const updated = [...fields]; updated[fieldIndex].options[optIndex] = value; setFields(updated); };
  const addOption = (fieldIndex) => { const updated = [...fields]; updated[fieldIndex].options.push(`Option ${updated[fieldIndex].options.length + 1}`); setFields(updated); };
  const removeOption = (fieldIndex, optIndex) => { const updated = [...fields]; updated[fieldIndex].options.splice(optIndex, 1); setFields(updated); };
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };
  const needsOptions = (type) => ["multiple_choice", "checkbox", "dropdown"].includes(type);

  // --- THEME STYLES ---
  const colors = { bg: "#09090b", sidebar: "#0f0f11", card: "#141416", border: "#27272a", textPrimary: "#f8fafc", textMuted: "#94a3b8", purple: "#9e8cfc", green: "#4ade80", pink: "#f472b6", inputBg: "#18181b" };

  const completedCount = entries.filter(e => e.isCompleted).length;
  const pendingCount = entries.length - completedCount;
  const completedPct = entries.length === 0 ? 0 : Math.round((completedCount / entries.length) * 100);

  const filteredEntries = entries.filter(entry => {
    if (filterStatus === "completed") return entry.isCompleted;
    if (filterStatus === "pending") return !entry.isCompleted;
    return true; 
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: colors.bg, color: colors.textPrimary, fontFamily: "'Inter', 'Segoe UI', sans-serif", overflow: "hidden", position: "relative" }}>
      
      {/* SIDEBAR */}
      <div style={{ width: "240px", background: colors.sidebar, borderRight: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", padding: "24px 0" }}>
        <div style={{ padding: "0 24px", marginBottom: "40px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "20px", height: "20px", background: colors.textPrimary, borderRadius: "4px", transform: "rotate(45deg)" }} />
          <span style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "0.5px" }}>FormBuilder</span>
        </div>

        <div style={{ padding: "0 16px", flex: 1 }}>
          <p style={{ fontSize: "11px", fontWeight: "700", color: colors.textMuted, margin: "0 0 12px 12px", letterSpacing: "1px" }}>WORKSPACE</p>
          
          <div style={{ ...navItem, background: view === "dashboard" && filterStatus === "all" ? "rgba(255,255,255,0.05)" : "transparent", color: view === "dashboard" && filterStatus === "all" ? "#fff" : colors.textMuted }} onClick={() => { clearBuilder(); setView("dashboard"); setFilterStatus("all"); }}>
            <LayoutDashboard size={18} /> <span style={{ fontSize: "15px" }}>All Surveys</span>
          </div>
          
          <div style={{ ...navItem, background: view === "dashboard" && filterStatus === "completed" ? "rgba(255,255,255,0.05)" : "transparent", color: view === "dashboard" && filterStatus === "completed" ? "#fff" : colors.textMuted }} onClick={() => { clearBuilder(); setView("dashboard"); setFilterStatus("completed"); }}>
            <CheckCircle size={18} /> <span style={{ fontSize: "15px" }}>Completed</span>
          </div>

          <div style={{ ...navItem, background: view === "dashboard" && filterStatus === "pending" ? "rgba(255,255,255,0.05)" : "transparent", color: view === "dashboard" && filterStatus === "pending" ? "#fff" : colors.textMuted }} onClick={() => { clearBuilder(); setView("dashboard"); setFilterStatus("pending"); }}>
            <Clock size={18} /> <span style={{ fontSize: "15px" }}>Pending</span>
          </div>

          <div style={{ ...navItem, background: view === "builder" ? "rgba(255,255,255,0.05)" : "transparent", color: view === "builder" ? "#fff" : colors.textMuted, marginTop: "16px" }} onClick={() => { clearBuilder(); setView("builder"); }}>
            <PenSquare size={18} /> <span style={{ fontSize: "15px" }}>Create Survey</span>
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>
          <button onClick={handleLogout} style={{ ...navItem, color: colors.pink, border: "none", background: "transparent", width: "100%", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <LogOut size={18} /> <span style={{ fontSize: "15px" }}>Log Out</span>
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* TOP HEADER */}
        <div style={{ height: "70px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 32px", background: colors.bg }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#fff" }}>Admin User</p>
              <p style={{ margin: 0, fontSize: "11px", color: colors.textMuted }}>{email}</p>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: colors.purple, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "700", fontSize: "14px" }}>AD</div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center" }}>
          
          {/* DASHBOARD VIEW */}
          {view === "dashboard" && (
            <div style={{ flex: 1, padding: "32px", maxWidth: "1200px" }}>
              
             

              {/* STATS & PIE CHART SECTION */}
              <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
                <div style={{ flex: 1, background: colors.card, borderRadius: "12px", padding: "24px", border: `1px solid ${colors.border}` }}>
                  <h3 style={{ margin: "0 0 24px", fontSize: "16px", fontWeight: "700", color: colors.textMuted }}>Quick Overview</h3>
                  <div style={{ display: "flex", gap: "40px" }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: "800", color: "#fff" }}>{entries.length}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: colors.textMuted, fontWeight: "600" }}>TOTAL SENT</p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: "800", color: colors.green }}>{completedPct}%</p>
                      <p style={{ margin: 0, fontSize: "12px", color: colors.textMuted, fontWeight: "600" }}>COMPLETION RATE</p>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, background: colors.card, borderRadius: "12px", padding: "24px", border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: "40px" }}>
                  <div style={{ position: "relative", width: "100px", height: "100px", borderRadius: "50%", background: entries.length === 0 ? colors.border : `conic-gradient(${colors.green} ${completedPct}%, ${colors.pink} 0)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: "70px", height: "70px", background: colors.card, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>{completedPct}%</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: colors.green }} />
                        <span style={{ fontSize: "13px", color: colors.textMuted, fontWeight: "600" }}>Completed</span>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>{completedCount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: colors.pink }} />
                        <span style={{ fontSize: "13px", color: colors.textMuted, fontWeight: "600" }}>Pending</span>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>{pendingCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* YOUR SURVEYS TABLE */}
              <div style={{ background: colors.card, borderRadius: "12px", border: `1px solid ${colors.border}`, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Manage Surveys ({filteredEntries.length})</h3>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.border}`, textAlign: "left", color: colors.textMuted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      <th style={{ padding: "12px 0", fontWeight: "600" }}>Survey Title</th>
                      <th style={{ padding: "12px 0", fontWeight: "600" }}>Date Created</th>
                      <th style={{ padding: "12px 0", fontWeight: "600" }}>Assigned To</th>
                      <th style={{ padding: "12px 0", fontWeight: "600" }}>Status / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry, idx) => {
                      const iconColor = entry.isCompleted ? colors.green : colors.pink;
                      return (
                        <tr key={entry._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `rgba(${entry.isCompleted ? '74, 222, 128' : '244, 114, 182'}, 0.1)`, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor }}>
                              <FileText size={16} />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#fff" }}>{entry.title}</p>
                              <p style={{ margin: "2px 0 0", fontSize: "11px", color: colors.textMuted }}>{entry.fields?.length || 0} Questions</p>
                            </div>
                          </td>
                          <td style={{ padding: "16px 0" }}>
                            <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>{new Date(entry.createdAt).toLocaleDateString()}</p>
                            <p style={{ margin: "2px 0 0", fontSize: "11px", color: colors.textMuted }}>{new Date(entry.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </td>
                          <td style={{ padding: "16px 0", fontSize: "13px", color: "#fff" }}>{entry.assignedTo}</td>
                          <td style={{ padding: "16px 0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: entry.isCompleted ? "rgba(74, 222, 128, 0.1)" : "rgba(244, 114, 182, 0.1)", color: entry.isCompleted ? colors.green : colors.pink }}>
                                {entry.isCompleted ? "Complete" : "Pending"}
                              </span>
                              
                              {entry.isCompleted ? (
                                <button onClick={() => setViewingResponse(entry)} style={{ background: "transparent", border: `1px solid ${colors.green}`, color: colors.green, padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Eye size={14} /> View Answers
                                </button>
                              ) : (
                                <>
                                  <button onClick={() => handleEditClick(entry)} style={{ background: "transparent", border: "none", color: colors.textMuted, cursor: "pointer", display: "flex", alignItems: "center" }} title="Edit Survey"><Pencil size={16} /></button>
                                  <button onClick={() => { const link = `${window.location.origin}/survey/${entry._id}`; navigator.clipboard.writeText(link); alert(`Link copied!\n${link}`); }} style={{ background: "transparent", border: "none", color: colors.purple, cursor: "pointer", display: "flex", alignItems: "center" }} title="Copy Link"><LinkIcon size={16} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredEntries.length === 0 && (
                      <tr><td colSpan="4" style={{ padding: "32px 0", textAlign: "center", color: colors.textMuted, fontSize: "13px" }}>No surveys found in this category.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BUILDER VIEW */}
          {view === "builder" && (
            <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
              <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
                    <PenSquare size={24} color={colors.purple} /> {editingId ? "Edit Survey" : "New Form Builder"}
                  </h2>
                  <button onClick={() => setView("dashboard")} style={{ background: "transparent", color: colors.textMuted, border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}><X size={16}/> Cancel</button>
                </div>

                {message && <div style={{ background: "rgba(74, 222, 128, 0.1)", border: `1px solid ${colors.green}`, color: colors.green, padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle size={16}/> {message}</div>}
                {error && <div style={{ background: "rgba(244, 114, 182, 0.1)", border: `1px solid ${colors.pink}`, color: colors.pink, padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>{error}</div>}

                <div style={{ background: colors.card, borderRadius: "12px", padding: "24px", marginBottom: "16px", border: `1px solid ${colors.border}` }}>
                  <label style={darkLabel}>Assign To User (Email)</label>
                  <input value={targetEmail} onChange={e => setTargetEmail(e.target.value)} placeholder="user@company.com" style={{ ...darkInput, marginBottom: "20px" }} />
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Survey Title" style={{ width: "100%", border: "none", background: "transparent", fontSize: "24px", fontWeight: "800", color: "#fff", outline: "none", marginBottom: "8px" }} />
                  <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a description..." style={{ width: "100%", border: "none", background: "transparent", fontSize: "14px", color: colors.textMuted, outline: "none" }} />
                </div>

                {fields.map((f, i) => (
                  <div key={f.name} style={{ background: colors.card, borderRadius: "12px", padding: "24px", marginBottom: "12px", border: `1px solid ${colors.border}`, borderLeft: `4px solid ${colors.purple}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <input value={f.label} onChange={e => { const u = [...fields]; u[i].label = e.target.value; setFields(u); }} placeholder="Question Label" style={{ width: "100%", border: "none", borderBottom: `1px solid ${colors.border}`, background: "transparent", fontSize: "16px", fontWeight: "600", color: "#fff", paddingBottom: "8px", outline: "none" }} />
                        <div style={{ display: "flex", gap: "12px", marginTop: "12px", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", background: "rgba(158, 140, 252, 0.1)", color: colors.purple, padding: "4px 10px", borderRadius: "4px", fontWeight: "700" }}>{FIELD_TYPES.find(t => t.value === f.type)?.label?.toUpperCase()}</span>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: colors.textMuted, cursor: "pointer" }}><input type="checkbox" checked={f.required} onChange={e => { const u = [...fields].map((ff, fi) => fi === i ? { ...ff, required: e.target.checked } : ff); setFields(u); }} /> Required</label>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => moveField(i, -1)} style={darkIconBtn}><ChevronUp size={16} /></button>
                        <button onClick={() => moveField(i, 1)} style={darkIconBtn}><ChevronDown size={16} /></button>
                        <button onClick={() => handleDelete(f.name)} style={{ ...darkIconBtn, color: colors.pink }}><X size={16} /></button>
                      </div>
                    </div>

                    {needsOptions(f.type) && (
                      <div style={{ marginTop: "16px" }}>
                        {f.options?.map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            <div style={{ width: "14px", height: "14px", borderRadius: f.type === "checkbox" ? "3px" : "50%", border: `2px solid ${colors.textMuted}` }} />
                            <input value={opt} onChange={e => updateOption(i, oi, e.target.value)} style={{ flex: 1, border: "none", borderBottom: `1px solid ${colors.border}`, background: "transparent", color: "#fff", padding: "4px 0", outline: "none", fontSize: "14px" }} />
                            <button onClick={() => removeOption(i, oi)} style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer", display: "flex", alignItems: "center" }}><X size={14} /></button>
                          </div>
                        ))}
                        <button onClick={() => addOption(i)} style={{ background: "none", border: "none", color: colors.purple, cursor: "pointer", fontSize: "12px", fontWeight: "600", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={14} /> Add option</button>
                      </div>
                    )}
                  </div>
                ))}

                <div style={{ background: "transparent", borderRadius: "12px", padding: "24px", border: `1px dashed ${colors.border}`, marginTop: "24px" }}>
                  <p style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" }}>Add New Question</p>
                  <form onSubmit={handleAddField}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div><label style={darkLabel}>Question Label</label><input placeholder="e.g. What is your age?" value={newField.label} onChange={e => setNewField({ ...newField, label: e.target.value })} style={darkInput} /></div>
                      <div><label style={darkLabel}>Type</label><select value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })} style={darkInput}>{FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                    </div>
                    {needsOptions(newField.type) && (
                      <div style={{ marginBottom: "16px" }}>
                        <label style={darkLabel}>Options</label>
                        {newField.options.map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                            <input value={opt} onChange={e => { const opts = [...newField.options]; opts[oi] = e.target.value; setNewField({ ...newField, options: opts }); }} style={darkInput} placeholder={`Option ${oi + 1}`} />
                            <button type="button" onClick={() => setNewField({ ...newField, options: newField.options.filter((_, idx) => idx !== oi) })} style={{ background: "none", border: "none", color: colors.pink, cursor: "pointer", display: "flex", alignItems: "center" }}><X size={16} /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => setNewField({ ...newField, options: [...newField.options, `Option ${newField.options.length + 1}`] })} style={{ background: "none", border: "none", color: colors.purple, cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={14} /> Add option</button>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: colors.textMuted }}><input type="checkbox" checked={newField.required} onChange={e => setNewField({ ...newField, required: e.target.checked })} /> Mark as required</label>
                      <button type="submit" style={{ padding: "10px 24px", background: colors.inputBg, color: "#fff", border: `1px solid ${colors.border}`, borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>Add Question to Form</button>
                    </div>
                  </form>
                </div>

                <div style={{ marginTop: "32px", padding: "24px", background: colors.card, borderRadius: "12px", border: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Ready to send?</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: colors.textMuted }}>This survey will be securely dispatched to {targetEmail || "the assigned user"}.</p>
                  </div>
                  <button onClick={handleSendSurvey} style={{ padding: "14px 32px", background: colors.purple, color: "#000", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "800", cursor: "pointer" }}>
                    {editingId ? "Update Survey" : "Dispatch Survey"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* VIEW RESPONSES MODAL OVERLAY */}
      {viewingResponse && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          
          <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, width: "100%", maxWidth: "600px", maxHeight: "85vh", borderRadius: "16px", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            
            <div style={{ padding: "24px 32px", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: colors.card, borderRadius: "16px 16px 0 0" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#fff" }}>{viewingResponse.title} Answers</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: colors.textMuted }}>Submitted by: <span style={{ color: colors.green, fontWeight: "600" }}>{viewingResponse.assignedTo}</span></p>
              </div>
              <button onClick={() => setViewingResponse(null)} style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: "#fff", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
            </div>

            <div style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
              {(viewingResponse.fields || []).filter(f => f.type !== 'section').map((field, index) => {
                const answer = viewingResponse.responseData?.[field.name];
                const displayAnswer = Array.isArray(answer) ? answer.join(", ") : String(answer || "No answer provided");
                
                return (
                  <div key={index} style={{ marginBottom: "20px", background: colors.card, padding: "20px", borderRadius: "12px", border: `1px solid ${colors.border}` }}>
                    <p style={{ margin: "0 0 10px", fontSize: "14px", color: colors.textMuted, fontWeight: "600", lineHeight: "1.4" }}>
                      Q: {field.label}
                    </p>
                    <div style={{ background: colors.inputBg, padding: "12px 16px", borderRadius: "8px", borderLeft: `3px solid ${colors.purple}` }}>
                      <p style={{ margin: 0, fontSize: "15px", color: "#fff", fontWeight: "500", whiteSpace: "pre-wrap" }}>
                        {displayAnswer}
                      </p>
                    </div>
                  </div>
                );
              })}
              {(!viewingResponse.fields || viewingResponse.fields.length === 0) && (
                <p style={{ color: colors.textMuted, textAlign: "center" }}>No questions found in this survey record.</p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Reusable styled objects
const navItem = { padding: "12px 24px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "14px", fontWeight: "500", transition: "all 0.2s" };
const darkLabel = { display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" };
const darkInput = { width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #27272a", background: "#18181b", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" };
const darkIconBtn = { padding: "6px 10px", background: "#18181b", border: "1px solid #27272a", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#94a3b8" };