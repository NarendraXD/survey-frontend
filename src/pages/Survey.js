import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://survey-backend-pqqt.onrender.com/api";

export default function Survey() {
  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${API}/survey/config`)
      .then(res => {
        const f = res.data.fields || [];
        setFields(f);
        const init = {};
        f.forEach(field => { init[field.name] = ""; });
        setForm(init);
        setLoading(false);
      })
      .catch(() => {
        const defaults = [
          { label: "Name", name: "name", type: "text" },
          { label: "Surname", name: "surname", type: "text" },
          { label: "Phone", name: "phone", type: "text" },
          { label: "Address", name: "address", type: "textarea" },
        ];
        setFields(defaults);
        setForm({ name: "", surname: "", phone: "", address: "" });
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post(`${API}/survey`, { responseData: form });
      setSubmitted(true);
    } catch (err) {
      setError("Submission failed. Please try again.");
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <p style={{ color: "#6b7280" }}>Loading form...</p>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <div style={{ background: "#fff", padding: "48px", borderRadius: "12px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", maxWidth: "400px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
        <h2 style={{ margin: "0 0 8px", color: "#111", fontSize: "22px" }}>Response Submitted!</h2>
        <p style={{ color: "#6b7280", margin: "0 0 24px" }}>Thank you for filling out this survey.</p>
        <button onClick={() => { setSubmitted(false); setForm(Object.fromEntries(fields.map(f => [f.name, ""]))); }} style={{ padding: "10px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
          Submit Another Response
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{ background: "#4f46e5", borderRadius: "12px 12px 0 0", padding: "28px 32px" }}>
          <h1 style={{ margin: 0, color: "#fff", fontSize: "22px", fontWeight: "700" }}>📋 Survey Form</h1>
          <p style={{ margin: "6px 0 0", color: "#c7d2fe", fontSize: "14px" }}>Please fill out all the fields below</p>
        </div>

        {/* Form card */}
        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", marginBottom: "20px" }}>{error}</div>}

          {fields.length === 0 ? (
            <p style={{ color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No form fields configured yet. Please contact the admin.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              {fields.map((field) => (
                <div key={field.name} style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                    {field.label} <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={form[field.name] || ""}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", resize: "vertical" }}
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name] || ""}
                      onChange={handleChange}
                      required
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  )}
                </div>
              ))}
              <button type="submit" style={{ width: "100%", padding: "12px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "8px" }}>
                Submit Response
              </button>
            </form>
          )}
        </div>
        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#9ca3af" }}>Powered by SurveyApp</p>
      </div>
    </div>
  );
}

// camel casing were done
