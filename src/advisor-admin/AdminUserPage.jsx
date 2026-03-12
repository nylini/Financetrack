// pages/advisor-admin/AdminUsersPage.jsx
import { useState, useEffect } from "react";
import HttpService from "../../services/HttpService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    HttpService.get("/api/admin/users")
      .then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const roleMeta = {
    USER: { color: "#2563eb", bg: "#eff6ff", icon: "👤" },
    ADVISOR: { color: "#7c3aed", bg: "#f5f3ff", icon: "📈" },
    ADMIN: { color: "#dc2626", bg: "#fef2f2", icon: "🛠️" },
  };

  const filtered = users.filter(u =>
    (roleFilter === "ALL" || u.role === roleFilter) &&
    (u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = { ALL: users.length, USER: users.filter(u => u.role === "USER").length, ADVISOR: users.filter(u => u.role === "ADVISOR").length, ADMIN: users.filter(u => u.role === "ADMIN").length };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>👥 Registered Users</h2>

      <div style={styles.topRow}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..." style={styles.search} />
        <div style={styles.filters}>
          {["ALL", "USER", "ADVISOR", "ADMIN"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{
              ...styles.filterBtn,
              background: roleFilter === r ? "#1e3a5f" : "#f1f5f9",
              color: roleFilter === r ? "#fff" : "#374151",
            }}>
              {r} <span style={styles.count}>{counts[r]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <p style={styles.empty}>Loading users...</p> : filtered.length === 0 ? (
        <p style={styles.empty}>No users found.</p>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHead}>
            <span>#</span><span>Username</span><span>Email</span><span>Role</span>
          </div>
          {filtered.map((u, i) => {
            const meta = roleMeta[u.role] || roleMeta.USER;
            return (
              <div key={u.id} style={{ ...styles.tableRow, background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <span style={styles.idx}>{i + 1}</span>
                <span style={styles.uname}>
                  <div style={{ ...styles.miniAvatar, background: meta.bg, color: meta.color }}>{u.username?.[0]?.toUpperCase()}</div>
                  {u.username}
                </span>
                <span style={styles.email}>{u.email}</span>
                <span style={{ ...styles.roleBadge, background: meta.bg, color: meta.color }}>
                  {meta.icon} {u.role}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { fontFamily: "'Segoe UI', sans-serif", maxWidth: "860px", margin: "0 auto", padding: "24px" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" },
  topRow: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" },
  search: { padding: "11px 16px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  filters: { display: "flex", gap: "10px" },
  filterBtn: { padding: "8px 14px", border: "none", borderRadius: "20px", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  count: { background: "rgba(255,255,255,0.25)", borderRadius: "10px", padding: "1px 7px", fontSize: "12px" },
  table: { background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" },
  tableHead: { display: "grid", gridTemplateColumns: "50px 1.5fr 2fr 1fr", padding: "12px 20px", background: "#f8fafc", fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" },
  tableRow: { display: "grid", gridTemplateColumns: "50px 1.5fr 2fr 1fr", padding: "14px 20px", borderTop: "1px solid #f1f5f9", alignItems: "center" },
  idx: { color: "#94a3b8", fontSize: "13px" },
  uname: { display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", fontSize: "14px", color: "#0f172a" },
  miniAvatar: { width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", flexShrink: 0 },
  email: { fontSize: "13px", color: "#64748b" },
  roleBadge: { display: "inline-block", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: "40px" },
};
