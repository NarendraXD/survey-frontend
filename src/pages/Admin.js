import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://survey-backend-pqqt.onrender.com/api";

export default function Admin() {
  const [fields, setFields] = useState([]);
  const [entries, setEntries] = useState([]);
  const [newField, setNewField] = useState({ label: "", type: "text" });
  const [tab, setTab] = useState("fields");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
    } catch {
      setFields([
        { label: "Name", name: "name", type: "text" },
        { label: "Surname", name: "surname", type: "text" },
        { label: "Phone", name: "phone", type: "text" },
        { label: "Address", name: "address", type: "textarea" },
      ]);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API}/survey`, { headers: { Authorization: `Bearer ${token}` } });
      setEntries(res.data);
    } catch { }
  };

  const saveConfig = async (updatedFields) => {
    try {
      await axios.post(`${API}/survey/config`, { fields: updatedFields }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Form updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError("Failed to save. Try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAddField = (e) => {
    e.preventDefault();
    if (!newField.label.trim()) return;
    const name = newField.label.toLowerCase().replace(/\s+/g, "_");
    const updated = [...fields, { ...newField, name }];
    setFields(updated);
    saveConfig(updated);
    setNewField({ label: "", type: "text" });
  };

  const handleDelete = (name) => {
    const updated = fields.filter(f => f.name !== name);
    setFields(updated);
    saveConfig(updated);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(surveyLink);
    setMessage("Link copied to clipboard!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Segoe UI, Arial, sans-serif" }}>

      {/* Navbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#4f46e5" }}>📋 SurveyApp</span>
          <span style={{ background: "#ede9fe", color: "#6d28d9", fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "#6b7280" }}>{email}</span>
          <button onClick={handleLogout} style={{ padding: "7px 16px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "32px auto", padding: "0 20px" }}>

        {/* Share link banner */}
        <div style={{ background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <p style={{ margin: 0, fontWeight: "600", color: "#5b21b6", fontSize: "14px" }}>📎 Share this survey link with users</p>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#7c3aed" }}>{surveyLink}</p>
          </div>
          <button onClick={copyLink} style={{ padding: "8px 18px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>Copy Link</button>
        </div>

        {message && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{message}</div>}
        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", background: "#e5e7eb", padding: "4px", borderRadius: "10px", marginBottom: "24px", width: "fit-content" }}>
          {["fields", "entries"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", background: tab === t ? "#fff" : "transparent", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: tab === t ? "600" : "400", color: tab === t ? "#111" : "#6b7280", fontSize: "14px" }}>
              {t === "fields" ? "⚙️ Form Builder" : `📊 Responses (${entries.length})`}
            </button>
          ))}
        </div>

        {/* Form Builder Tab */}
        {tab === "fields" && (
          <div>
            {/* Add field form */}
            <div style={{ background: "#fff", borderRadius: "10px", padding: "24px", marginBottom: "20px", border: "1px solid #e5e7eb" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "600", color: "#111" }}>Add New Field</h3>
              <form onSubmit={handleAddField} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <input
                  placeholder="Field label (e.g. Company Name)"
                  value={newField.label}
                  onChange={e => setNewField({ ...newField, label: e.target.value })}
                  required
                  style={{ flex: 1, minWidth: "200px", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
                />
                <select
                  value={newField.type}
                  onChange={e => setNewField({ ...newField, type: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", background: "#fff" }}
                >
                  <option value="text">Short Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="textarea">Long Text</option>
                </select>
                <button type="submit" style={{ padding: "10px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                  + Add Field
                </button>
              </form>
            </div>

            {/* Fields list */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111" }}>Current Form Fields ({fields.length})</h3>
              </div>
              {fields.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>No fields yet. Add one above.</div>
              ) : (
                fields.map((f, i) => (
                  <div key={f.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: i < fields.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ width: "28px", height: "28px", background: "#ede9fe", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#6d28d9" }}>{i + 1}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: "600", color: "#111", fontSize: "14px" }}>{f.label}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>Type: {f.type} · Field name: {f.name}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(f.name)} style={{ padding: "6px 14px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Entries Tab */}
        {tab === "entries" && (
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111" }}>All Responses</h3>
              <button onClick={fetchEntries} style={{ padding: "7px 14px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>↻ Refresh</button>
            </div>
            {entries.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>No responses yet.</div>
            ) : (
              entries.map((entry, i) => (
                <div key={entry._id} style={{ padding: "16px 24px", borderBottom: i < entries.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>Response #{i + 1}</span>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                    {entry.responseData && Object.entries(entry.responseData).map(([key, val]) => (
                      <div key={key} style={{ background: "#f9fafb", padding: "8px 12px", borderRadius: "6px" }}>
                        <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "14px", color: "#111", fontWeight: "500" }}>{String(val)}</p>
                      </div>
                    ))}
                    {!entry.responseData && Object.entries(entry).map(([key, val]) => {
                      if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) return null;
                      return (
                        <div key={key} style={{ background: "#f9fafb", padding: "8px 12px", borderRadius: "6px" }}>
                          <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", textTransform: "capitalize" }}>{key}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "14px", color: "#111", fontWeight: "500" }}>{String(val)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
      // this is admin file 

            )}
          </div>
        )}
      </div>
    </div>
  );
}