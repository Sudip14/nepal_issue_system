import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatCards from "../components/StatCards";
import IssueCard from "../components/IssueCard";
import IssueForm from "../components/IssueForm";
import authController from "../controllers/authController";
import issueController from "../controllers/issueController";
import dashboardController from "../controllers/dashboardController";

function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState({ username: "", user_type: "citizen" });
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterWard, setFilterWard] = useState("all");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadIssues();
    loadStats();
  }, [filterCat, filterStatus, search, filterWard]);

  const loadUser = async () => {
    try {
      const data = await authController.getMe();
      setUser(data);
      if (data.user_type === "admin") navigate("/admin-panel");
      if (data.user_type === "authority") navigate("/authority");
    } catch {
      navigate("/login");
    }
  };

  const loadIssues = async () => {
    try {
      const data = await issueController.fetchIssues({
        category: filterCat,
        status: filterStatus,
        search: search,
        ward: filterWard,
      });
      setIssues(data);
    } catch {
      navigate("/login");
    }
  };

  const loadStats = async () => {
    try {
      const data = await dashboardController.fetchStats();
      setStats(data);
    } catch {}
  };

  const handleVote = async (id) => {
    try {
      await issueController.vote(id);
      loadIssues();
    } catch {}
  };

  const showMsg = (text) => {
    setMsg(text);
    setShowForm(false);
    loadIssues();
    loadStats();
    setTimeout(() => setMsg(""), 4000);
  };

  const inp = {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    fontSize: 13,
    background: "#fff",
  };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#F0F5FF" }}>
      <Navbar
        username={user.username}
        userType={user.user_type}
        onReport={() => setShowForm(!showForm)}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }}>
        {msg && (
          <div style={{ background: "#D1FAE5", color: "#065F46", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {msg}
          </div>
        )}

        <div style={{ background: "#DBEAFE", color: "#1E40AF", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          👤 <b>Citizen View</b> — Report issues and vote. Only authorities can update status.
        </div>

        <StatCards stats={stats} />

       {/* Export buttons */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            onClick={() => {
              const token = localStorage.getItem('access_token');
              fetch('http://127.0.0.1:8000/api/export/excel/', {
                headers: { Authorization: `Bearer ${token}` }
              })
              .then(res => res.blob())
              .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'issues_report.xlsx';
                a.click();
                window.URL.revokeObjectURL(url);
              });
            }}
            style={{ padding: "8px 16px", borderRadius: 8, background: "#16A34A", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
          >
            📊 Export Excel
          </button>
          <button
            onClick={() => {
const token = localStorage.getItem('access_token');
              fetch('http://127.0.0.1:8000/api/export/pdf/', {
                headers: { Authorization: `Bearer ${token}` }
              })
              .then(res => res.blob())
              .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'issues_report.pdf';
                a.click();
                window.URL.revokeObjectURL(url);
              });
            }}
            style={{ padding: "8px 16px", borderRadius: 8, background: "#DC2626", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
          >
            📄 Export PDF
          </button>
        </div>

        {showForm && (
          <IssueForm onSuccess={showMsg} onCancel={() => setShowForm(false)} />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
            <input
              style={{ ...inp, paddingLeft: 34, width: "100%", boxSizing: "border-box" }}
              placeholder="Search issues by title, address, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#64748B" }}
              >✕</button>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <select style={inp} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="all">All categories</option>
              {[["road","🛣 Road"],["water","💧 Water"],["power","⚡ Power"],["waste","🗑 Waste"],["drainage","🌊 Drainage"],["sanitation","🚿 Sanitation"],["other","📌 Other"]].map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select style={inp} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {["pending","under_review","assigned","in_progress","resolved","rejected"].map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
            <select style={inp} value={filterWard} onChange={(e) => setFilterWard(e.target.value)}>
              <option value="all">All wards</option>
              {Array.from({ length: 32 }, (_, i) => i + 1).map(w => (
                <option key={w} value={w}>Ward {w}</option>
              ))}
            </select>
            {(search || filterCat !== "all" || filterStatus !== "all" || filterWard !== "all") && (
              <button
                onClick={() => { setSearch(""); setFilterCat("all"); setFilterStatus("all"); setFilterWard("all"); }}
                style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}
              >✕ Clear all</button>
            )}
          </div>

          {search && (
            <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
              Found <b>{issues.length}</b> result{issues.length !== 1 ? "s" : ""} for "<b>{search}</b>"
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {issues.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#64748B", background: "#fff", borderRadius: 12 }}>
              No issues found. Be the first to report one!
            </div>
          )}
          {issues.map((issue, i) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              index={i}
              canUpdateStatus={false}
              onVote={handleVote}
              onStatusUpdate={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;