import { useState, useEffect, useCallback } from "react";
import "./App.css";

/* ═══════════════════════════════════════════════════════════════
   MOCK DATABASE  (remove when backend is ready)
═══════════════════════════════════════════════════════════════ */
const MOCK_USERS_DB = [
  { username: "Thanuja",    password: "2121",    role: "USER",    userId: "1" },
  { username: "Harini", password: "3232", role: "ADVISOR", userId: "2" },
  { username: "saba",   password: "5454",   role: "ADMIN",   userId: "3" },
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Salary",        type: "INCOME"  },
  { id: 2, name: "Freelance",     type: "INCOME"  },
  { id: 3, name: "Food",          type: "EXPENSE" },
  { id: 4, name: "Transport",     type: "EXPENSE" },
  { id: 5, name: "Utilities",     type: "EXPENSE" },
  { id: 6, name: "Subscriptions", type: "EXPENSE" },
  { id: 7, name: "Shopping",      type: "EXPENSE" },
];

const MOCK_TRANSACTIONS = [
  { id: 1, type: "INCOME",  description: "Monthly Salary",    category: { name: "Salary" },        date: "2025-03-01", amount: 85000 },
  { id: 2, type: "EXPENSE", description: "Grocery shopping",  category: { name: "Food" },           date: "2025-03-03", amount: 3200  },
  { id: 3, type: "EXPENSE", description: "Electricity bill",  category: { name: "Utilities" },      date: "2025-03-05", amount: 1850  },
  { id: 4, type: "INCOME",  description: "Freelance project", category: { name: "Freelance" },      date: "2025-03-08", amount: 12000 },
  { id: 5, type: "EXPENSE", description: "Petrol",            category: { name: "Transport" },      date: "2025-03-10", amount: 2100  },
  { id: 6, type: "EXPENSE", description: "Netflix & Spotify", category: { name: "Subscriptions" },  date: "2025-03-12", amount: 899   },
  { id: 7, type: "EXPENSE", description: "Clothes",           category: { name: "Shopping" },       date: "2025-03-14", amount: 4500  },
];

const MOCK_BUDGETS = [
  { id: 1, category: { name: "Food" },          limitAmount: 5000, month: 3, year: 2025 },
  { id: 2, category: { name: "Transport" },     limitAmount: 3000, month: 3, year: 2025 },
  { id: 3, category: { name: "Utilities" },     limitAmount: 2500, month: 3, year: 2025 },
  { id: 4, category: { name: "Subscriptions" }, limitAmount: 1000, month: 3, year: 2025 },
  { id: 5, category: { name: "Shopping" },      limitAmount: 3000, month: 3, year: 2025 },
];

const MOCK_SUMMARY = {
  totalIncome: 97000,
  totalExpenses: 12549,
  netBalance: 84451,
  categoryBreakdown: [
    { categoryName: "Food",          actualSpent: 3200, limitAmount: 5000 },
    { categoryName: "Transport",     actualSpent: 2100, limitAmount: 3000 },
    { categoryName: "Utilities",     actualSpent: 1850, limitAmount: 2500 },
    { categoryName: "Subscriptions", actualSpent: 1099, limitAmount: 1000 },
    { categoryName: "Shopping",      actualSpent: 4500, limitAmount: 3000 },
  ],
};

const MOCK_CLIENTS = [
  { id: 1, username: "nalini", email: "nalini@email.com" },
  { id: 2, username: "lakshmi",  email: "lakshmi@email.com" },
  { id: 3, username: "arjun",  email: "arjun@email.com" },
];

const MOCK_ALL_USERS = [
  { id: 1, username: "Thanuja",         email: "Thanuja@fintrack.com",    role: "USER"    },
  { id: 2, username: "harini",      email: "harini@fintrack.com", role: "ADVISOR" },
  { id: 3, username: "saba",        email: "saba@fintrack.com",   role: "ADMIN"   },
  { id: 4, username: "nalini", email: "nalini@email.com",      role: "USER"    },
  { id: 5, username: "lakshmi",  email: "lakshmi@email.com",      role: "USER"    },
  { id: 6, username: "arjun",  email: "arjun@email.com",      role: "USER"    },
];

/* ═══════════════════════════════════════════════════════════════
   MOCK HTTP
═══════════════════════════════════════════════════════════════ */
const delay = ms => new Promise(res => setTimeout(res, ms));

const Http = {
  get: async (url) => {
    await delay(400);
    if (url === "/api/finance/categories")       return MOCK_CATEGORIES;
    if (url === "/api/finance/transactions")     return MOCK_TRANSACTIONS;
    if (url === "/api/finance/budgets")          return MOCK_BUDGETS;
    if (url === "/api/finance/summary")          return MOCK_SUMMARY;
    if (url === "/api/advisor/clients")          return MOCK_CLIENTS;
    if (url.startsWith("/api/advisor/client"))   return MOCK_SUMMARY;
    if (url === "/api/admin/categories")         return MOCK_CATEGORIES;
    if (url === "/api/admin/users")              return MOCK_ALL_USERS;
    return [];
  },
  post: async () => { await delay(500); return { success: true }; },
};

/* ═══════════════════════════════════════════════════════════════
   AUTH SERVICE
═══════════════════════════════════════════════════════════════ */
const Auth = {
  login: async (username, password) => {
    await delay(600);
    const found = MOCK_USERS_DB.find(u => u.username === username && u.password === password);
    if (!found) throw { response: { data: { message: "Invalid username or password." } } };
    localStorage.setItem("jwt_token", "mock-token-" + found.role);
    localStorage.setItem("user_role", found.role);
    localStorage.setItem("user_id",   found.userId);
    localStorage.setItem("username",  found.username);
    return found;
  },
  register: async () => { await delay(500); return { success: true }; },
  logout:   () => ["jwt_token","user_role","user_id","username"].forEach(k => localStorage.removeItem(k)),
  role:     () => localStorage.getItem("user_role"),
  userId:   () => localStorage.getItem("user_id"),
  username: () => localStorage.getItem("username"),
  loggedIn: () => !!localStorage.getItem("jwt_token"),
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = n => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════════════════ */
function Spinner() {
  return <div className="ft-loading"><div className="ft-spinner"></div></div>;
}

function Alert({ type = "error", children }) {
  return <div className={`ft-alert ft-alert-${type}`}>{children}</div>;
}

function StatCard({ label, value, type = "neutral", icon }) {
  return (
    <div className={`ft-stat-card ft-stat-${type}`}>
      <div className="ft-stat-header">
        <span className="ft-stat-label">{label}</span>
        <span className="ft-stat-icon">{icon}</span>
      </div>
      <div className="ft-stat-value">{value}</div>
    </div>
  );
}

function Empty({ icon = "📭", text = "No data found." }) {
  return (
    <div className="ft-empty">
      <div className="ft-empty-icon">{icon}</div>
      <p>{text}</p>
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div className="ft-section-title">
      <h2>{children}</h2>
      {sub && <p className="ft-section-sub">{sub}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBER 8 — LOGIN PAGE
═══════════════════════════════════════════════════════════════ */
function LoginPage({ onLogin, goRegister }) {
  const [form, setForm] = useState({ username: "Thanuja", password: "2121" });
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await Auth.login(form.username, form.password);
      onLogin(r.role);
    } catch (e) {
      setErr(e.response?.data?.message || "Invalid username or password.");
    } finally { setBusy(false); }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-logo">💰 FinTrack</div>
        <h1 className="login-headline">Manage your<br />finances with<br />clarity.</h1>
        <p className="login-desc">Track transactions, set budgets, and get monthly insights — all in one place.</p>
        <div className="login-role-cards">
          {[["👤","Users","Log & track"],["📈","Advisors","Review clients"],["🛠️","Admins","Manage platform"]].map(([ic, r, d]) => (
            <div className="login-role-card" key={r}>
              <div className="login-role-icon">{ic}</div>
              <div className="login-role-name">{r}</div>
              <div className="login-role-desc">{d}</div>
            </div>
          ))}
        </div>
        <div className="demo-creds">
          <div className="demo-creds-title">🔑 Demo Credentials</div>
          <div className="demo-creds-row"><span className="demo-role user">USER</span><span>user / user123</span></div>
          <div className="demo-creds-row"><span className="demo-role advisor">ADVISOR</span><span>advisor / advisor123</span></div>
          <div className="demo-creds-row"><span className="demo-role admin">ADMIN</span><span>admin / admin123</span></div>
        </div>
      </div>
      <div className="login-right">
        <div className="ft-card login-card">
          <h2 className="login-card-title">Welcome back</h2>
          <p className="login-card-sub">Sign in to your account</p>
          {err && <Alert>{err}</Alert>}
          <form onSubmit={submit} className="ft-form">
            <div className="ft-field">
              <label className="ft-label">Username</label>
              <input className="ft-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Enter username" required />
            </div>
            <div className="ft-field">
              <label className="ft-label">Password</label>
              <input className="ft-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password" required />
            </div>
            <button className="ft-btn ft-btn-primary ft-btn-full" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign In →"}
            </button>
          </form>
          <div className="quick-login">
            <p className="quick-login-label">Quick Login:</p>
            <div className="quick-login-btns">
              <button className="ft-btn ft-btn-sm" style={{background:"#eff6ff",color:"#1d4ed8"}} onClick={()=>setForm({username:"user",password:"user123"})}>👤 User</button>
              <button className="ft-btn ft-btn-sm" style={{background:"#f5f3ff",color:"#6d28d9"}} onClick={()=>setForm({username:"advisor",password:"advisor123"})}>📈 Advisor</button>
              <button className="ft-btn ft-btn-sm" style={{background:"#fff1f2",color:"#be123c"}} onClick={()=>setForm({username:"admin",password:"admin123"})}>🛠️ Admin</button>
            </div>
          </div>
          <p className="ft-switch-text">No account? <button className="ft-link-btn" onClick={goRegister}>Register</button></p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBER 8 — REGISTRATION PAGE
═══════════════════════════════════════════════════════════════ */
function RegistrationPage({ goLogin }) {
  const [form, setForm] = useState({ username: "Thanuja", email: "Thanuja@gmail.com", password: "2121", role: "USER" });
  const [err,  setErr]  = useState("");
  const [ok,   setOk]   = useState("");
  const [busy, setBusy] = useState(false);

  const roleConfig = {
    USER:    { color: "#2563eb", bg: "#eff6ff", icon: "👤" },
    ADVISOR: { color: "#7c3aed", bg: "#f5f3ff", icon: "📈" },
    ADMIN:   { color: "#dc2626", bg: "#fff1f2", icon: "🛠️" },
  };
  const rc = roleConfig[form.role];

  const submit = async e => {
    e.preventDefault(); setErr(""); setOk(""); setBusy(true);
    try {
      await Auth.register();
      setOk("Account created! You can now sign in.");
    } catch (e) {
      setErr("Registration failed.");
    } finally { setBusy(false); }
  };

  return (
    <div className="register-wrapper">
      <div className="ft-card register-card">
        <div className="register-logo">💰 FinTrack</div>
        <h2 className="register-title">Create account</h2>
        <p className="register-sub">Join FinTrack to take control of your finances</p>
        {err && <Alert>{err}</Alert>}
        {ok  && <Alert type="success">{ok}</Alert>}
        <form onSubmit={submit} className="ft-form">
          <div className="ft-grid-2">
            <div className="ft-field">
              <label className="ft-label">Username</label>
              <input className="ft-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="username" required />
            </div>
            <div className="ft-field">
              <label className="ft-label">Email</label>
              <input className="ft-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" required />
            </div>
          </div>
          <div className="ft-field">
            <label className="ft-label">Password</label>
            <input className="ft-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Create password" required />
          </div>
          <div className="ft-field">
            <label className="ft-label">Role</label>
            <div className="ft-type-toggle">
              {Object.entries(roleConfig).map(([r, { icon }]) => (
                <div key={r} className="ft-type-opt"
                  onClick={() => setForm({ ...form, role: r })}
                  style={form.role === r ? { borderColor: roleConfig[r].color, background: roleConfig[r].bg, color: roleConfig[r].color } : {}}>
                  {icon} {r}
                </div>
              ))}
            </div>
          </div>
          <button className="ft-btn ft-btn-full" type="submit" disabled={busy}
            style={{ background: `linear-gradient(135deg,${rc.color},${rc.color}cc)`, color:"#fff", border:"none", borderRadius:10, padding:"13px", fontWeight:600, fontSize:14, cursor:"pointer" }}>
            {busy ? "Creating…" : "Create Account"}
          </button>
        </form>
        <p className="ft-switch-text">Have an account? <button className="ft-link-btn" onClick={goLogin}>Sign In</button></p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBER 9 — ADD TRANSACTION FORM
═══════════════════════════════════════════════════════════════ */
function AddTransactionForm({ onAdded }) {
  const [form, setForm] = useState({ type: "EXPENSE", amount: "", description: "", categoryId: "", date: new Date().toISOString().slice(0, 10) });
  const [cats, setCats] = useState([]);
  const [err,  setErr]  = useState("");
  const [ok,   setOk]   = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { Http.get("/api/finance/categories").then(setCats).catch(() => {}); }, []);
  const filtered = cats.filter(c => c.type === form.type);

  const submit = async e => {
    e.preventDefault(); setErr(""); setOk(""); setBusy(true);
    try {
      await Http.post("/api/finance/transaction", form);
      setOk("Transaction logged!");
      setForm({ type: "EXPENSE", amount: "", description: "", categoryId: "", date: new Date().toISOString().slice(0, 10) });
      onAdded?.();
    } catch (e) {
      setErr("Failed to add transaction.");
    } finally { setBusy(false); }
  };

  return (
    <div className="ft-card ft-mb-24">
      <SectionTitle>➕ Log Transaction</SectionTitle>
      {err && <Alert>{err}</Alert>}
      {ok  && <Alert type="success">{ok}</Alert>}
      <form onSubmit={submit} className="ft-form">
        <div className="ft-field">
          <label className="ft-label">Type</label>
          <div className="ft-type-toggle">
            <div className={`ft-type-opt ${form.type === "INCOME"  ? "income-active"  : ""}`} onClick={() => setForm({ ...form, type: "INCOME",  categoryId: "" })}>📈 INCOME</div>
            <div className={`ft-type-opt ${form.type === "EXPENSE" ? "expense-active" : ""}`} onClick={() => setForm({ ...form, type: "EXPENSE", categoryId: "" })}>📉 EXPENSE</div>
          </div>
        </div>
        <div className="ft-grid-2">
          <div className="ft-field">
            <label className="ft-label">Category</label>
            <select className="ft-input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Select…</option>
              {filtered.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="ft-field">
            <label className="ft-label">Amount (₹)</label>
            <input className="ft-input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" min="0.01" step="0.01" required />
          </div>
        </div>
        <div className="ft-grid-2">
          <div className="ft-field">
            <label className="ft-label">Description</label>
            <input className="ft-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief note" required />
          </div>
          <div className="ft-field">
            <label className="ft-label">Date</label>
            <input className="ft-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>
        </div>
        <button className={`ft-btn ${form.type === "INCOME" ? "ft-btn-success" : "ft-btn-danger"}`} disabled={busy}>
          {busy ? "Saving…" : `Add ${form.type === "INCOME" ? "Income" : "Expense"}`}
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBER 9 — TRANSACTIONS PAGE
═══════════════════════════════════════════════════════════════ */
function TransactionsPage() {
  const [all,      setAll]      = useState([]);
  const [filter,   setFilter]   = useState("ALL");
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Http.get("/api/finance/transactions").then(setAll).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const list         = filter === "ALL" ? all : all.filter(t => t.type === filter);
  const totalIncome  = all.filter(t => t.type === "INCOME").reduce((s, t)  => s + t.amount, 0);
  const totalExpense = all.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="ft-fade-in">
      <div className="ft-topbar">
        <SectionTitle sub={`${all.length} total transactions`}>📜 Transactions</SectionTitle>
        <button className="ft-btn ft-btn-primary ft-btn-sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? "✕ Close" : "＋ Add New"}
        </button>
      </div>
      {showForm && <AddTransactionForm onAdded={() => { load(); setShowForm(false); }} />}
      <div className="ft-stat-grid ft-mb-24">
        <StatCard label="Total Income"   value={fmt(totalIncome)}               type="income"  icon="📈" />
        <StatCard label="Total Expenses" value={fmt(totalExpense)}              type="expense" icon="📉" />
        <StatCard label="Net Balance"    value={fmt(totalIncome - totalExpense)} type="balance" icon="💰" />
      </div>
      <div className="ft-card">
        <div className="ft-filter-row">
          {["ALL","INCOME","EXPENSE"].map(f => (
            <button key={f} className={`ft-btn ft-btn-sm ${filter === f ? "ft-btn-primary" : "ft-btn-ghost"}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        {loading ? <Spinner /> : list.length === 0 ? <Empty icon="💸" text="No transactions yet." /> : (
          <table className="ft-table">
            <thead><tr><th>Type</th><th>Description</th><th>Category</th><th>Date</th><th className="text-right">Amount</th></tr></thead>
            <tbody>
              {list.map(t => (
                <tr key={t.id}>
                  <td><span className={`ft-badge ft-badge-${t.type.toLowerCase()}`}>{t.type === "INCOME" ? "📈" : "📉"} {t.type}</span></td>
                  <td className="ft-fw-500">{t.description}</td>
                  <td className="ft-text-muted">{t.category?.name}</td>
                  <td className="ft-mono ft-text-muted">{t.date}</td>
                  <td className={`ft-mono ft-fw-700 text-right ${t.type === "INCOME" ? "ft-text-green" : "ft-text-red"}`}>
                    {t.type === "INCOME" ? "+" : "-"}{fmt(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBER 9 — BUDGET SETUP PAGE
═══════════════════════════════════════════════════════════════ */
function BudgetSetupPage() {
  const [cats,    setCats]    = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [form,    setForm]    = useState({ categoryId: "", limitAmount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [err,     setErr]     = useState("");
  const [ok,      setOk]      = useState("");
  const [busy,    setBusy]    = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBudgets = () => Http.get("/api/finance/budgets").then(setBudgets).catch(() => {});

  useEffect(() => {
    Promise.all([
      Http.get("/api/finance/categories").then(d => setCats(d.filter(c => c.type === "EXPENSE"))).catch(() => {}),
      loadBudgets()
    ]).finally(() => setLoading(false));
  }, []);

  const submit = async e => {
    e.preventDefault(); setErr(""); setOk(""); setBusy(true);
    try {
      await Http.post("/api/finance/budget", form);
      setOk("Budget saved!");
      setForm({ categoryId: "", limitAmount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    } catch (e) {
      setErr("Failed to save budget.");
    } finally { setBusy(false); }
  };

  return (
    <div className="ft-fade-in">
      <SectionTitle sub="Set monthly spending limits per category">📋 Budget Planner</SectionTitle>
      <div className="ft-grid-2">
        <div className="ft-card">
          <h3 className="ft-card-heading">Set New Budget</h3>
          {err && <Alert>{err}</Alert>}
          {ok  && <Alert type="success">{ok}</Alert>}
          <form onSubmit={submit} className="ft-form">
            <div className="ft-field">
              <label className="ft-label">Category (Expense)</label>
              <select className="ft-input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Select category…</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="ft-field">
              <label className="ft-label">Monthly Limit (₹)</label>
              <input className="ft-input" type="number" value={form.limitAmount} onChange={e => setForm({ ...form, limitAmount: e.target.value })} placeholder="5000.00" min="1" step="0.01" required />
            </div>
            <div className="ft-grid-2">
              <div className="ft-field">
                <label className="ft-label">Month</label>
                <select className="ft-input" value={form.month} onChange={e => setForm({ ...form, month: +e.target.value })}>
                  {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="ft-field">
                <label className="ft-label">Year</label>
                <input className="ft-input" type="number" value={form.year} onChange={e => setForm({ ...form, year: +e.target.value })} min="2020" max="2099" />
              </div>
            </div>
            <button className="ft-btn ft-btn-primary" disabled={busy}>{busy ? "Saving…" : "Save Budget"}</button>
          </form>
        </div>
        <div className="ft-card">
          <h3 className="ft-card-heading">Active Budgets</h3>
          {loading ? <Spinner /> : budgets.length === 0 ? <Empty icon="📋" text="No budgets set yet." /> : (
            <div className="ft-budget-list">
              {budgets.map(b => (
                <div key={b.id} className="ft-budget-row">
                  <div>
                    <div className="ft-fw-600">{b.category?.name}</div>
                    <div className="ft-text-muted ft-text-sm">{months[b.month - 1]} {b.year}</div>
                  </div>
                  <div className="ft-budget-amt">{fmt(b.limitAmount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBER 9 — MONTHLY SUMMARY PAGE
═══════════════════════════════════════════════════════════════ */
function MonthlySummaryPage() {
  const [summary, setSummary] = useState(null);
  const [month,   setMonth]   = useState(new Date().getMonth() + 1);
  const [year,    setYear]    = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Http.get("/api/finance/summary").then(setSummary).catch(() => {}).finally(() => setLoading(false));
  }, [month, year]);

  const pct = (a, l) => l > 0 ? Math.min((a / l) * 100, 100) : 0;

  return (
    <div className="ft-fade-in">
      <div className="ft-topbar">
        <SectionTitle sub="Budget vs actual breakdown">📊 Monthly Summary</SectionTitle>
        <div className="ft-date-controls">
          <select className="ft-input ft-input-auto" value={month} onChange={e => setMonth(+e.target.value)}>
            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <input className="ft-input ft-input-year" type="number" value={year} onChange={e => setYear(+e.target.value)} min="2020" max="2099" />
        </div>
      </div>
      {loading ? <Spinner /> : summary && (
        <>
          <div className="ft-stat-grid ft-mb-24">
            <StatCard label="Total Income"   value={fmt(summary.totalIncome)}   type="income"  icon="📈" />
            <StatCard label="Total Expenses" value={fmt(summary.totalExpenses)} type="expense" icon="📉" />
            <StatCard label="Net Balance"    value={fmt(summary.netBalance)}    type="balance" icon="💰" />
          </div>
          <div className="ft-card">
            <h3 className="ft-card-heading">Category Breakdown</h3>
            <div className="ft-cat-list">
              {summary.categoryBreakdown.map(cat => {
                const over = cat.actualSpent > cat.limitAmount;
                const p    = pct(cat.actualSpent, cat.limitAmount);
                return (
                  <div key={cat.categoryName} className={`ft-cat-row ${over ? "ft-cat-over" : ""}`}>
                    <div className="ft-cat-header">
                      <span className="ft-fw-600">{cat.categoryName}</span>
                      <span className={`ft-badge ${over ? "ft-badge-over" : "ft-badge-ok"}`}>{over ? "⚠️ Over Budget" : "✅ On Track"}</span>
                    </div>
                    <div className="ft-cat-amounts">
                      <span className="ft-text-red ft-fw-600">Spent: {fmt(cat.actualSpent)}</span>
                      <span className="ft-text-muted">Limit: {fmt(cat.limitAmount)}</span>
                    </div>
                    <div className="ft-progress-bar">
                      <div className="ft-progress-fill" style={{ width: `${p}%`, background: over ? "linear-gradient(90deg,#b91c1c,#ef4444)" : "linear-gradient(90deg,#1e40af,#3b82f6)" }}></div>
                    </div>
                    <div className="ft-progress-pct">{p.toFixed(0)}% used</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBER 10 — ADVISOR CLIENT LIST
═══════════════════════════════════════════════════════════════ */
function AdvisorClientListPage({ onSelect }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Http.get("/api/advisor/clients").then(setClients).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="ft-fade-in">
      <SectionTitle sub={`${clients.length} assigned client(s)`}>📈 My Clients</SectionTitle>
      {loading ? <Spinner /> : clients.length === 0 ? <Empty icon="👥" text="No clients assigned yet." /> : (
        <div className="ft-client-list">
          {clients.map(c => (
            <div key={c.id} className="ft-card ft-client-card" onClick={() => onSelect(c)}>
              <div className="ft-avatar ft-avatar-advisor">{c.username?.[0]?.toUpperCase()}</div>
              <div className="ft-client-info">
                <div className="ft-fw-700">{c.username}</div>
                <div className="ft-text-muted ft-text-sm">{c.email}</div>
              </div>
              <button className="ft-btn ft-btn-sm ft-btn-advisor">View Summary →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBER 10 — ADVISOR CLIENT DETAIL
═══════════════════════════════════════════════════════════════ */
function AdvisorClientPage({ client, onBack }) {
  const [summary, setSummary] = useState(null);
  const [month,   setMonth]   = useState(new Date().getMonth() + 1);
  const [year,    setYear]    = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    Http.get(`/api/advisor/client/${client.id}/summary`).then(setSummary).catch(() => {}).finally(() => setLoading(false));
  }, [client, month, year]);

  return (
    <div className="ft-fade-in">
      <div className="ft-topbar">
        <div className="ft-client-detail-header">
          <button className="ft-btn ft-btn-ghost ft-btn-sm" onClick={onBack}>← Back</button>
          <div className="ft-avatar ft-avatar-advisor">{client?.username?.[0]?.toUpperCase()}</div>
          <div>
            <h2 className="ft-client-name">{client?.username}</h2>
            <p className="ft-text-muted ft-text-sm">{client?.email}</p>
          </div>
        </div>
        <div className="ft-date-controls">
          <select className="ft-input ft-input-auto" value={month} onChange={e => setMonth(+e.target.value)}>
            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <input className="ft-input ft-input-year" type="number" value={year} onChange={e => setYear(+e.target.value)} min="2020" max="2099" />
        </div>
      </div>
      {loading ? <Spinner /> : summary && (
        <>
          <div className="ft-stat-grid ft-mb-24">
            <StatCard label="Income"      value={fmt(summary.totalIncome)}   type="income"  icon="📈" />
            <StatCard label="Expenses"    value={fmt(summary.totalExpenses)} type="expense" icon="📉" />
            <StatCard label="Net Balance" value={fmt(summary.netBalance)}    type="neutral" icon="💎" />
          </div>
          <div className="ft-card">
            <h3 className="ft-card-heading">Category Breakdown</h3>
            <table className="ft-table">
              <thead><tr><th>Category</th><th>Spent</th><th>Limit</th><th>Status</th></tr></thead>
              <tbody>
                {summary.categoryBreakdown.map(cat => {
                  const over = cat.actualSpent > cat.limitAmount;
                  return (
                    <tr key={cat.categoryName}>
                      <td className="ft-fw-600">{cat.categoryName}</td>
                      <td className="ft-mono ft-text-red ft-fw-600">{fmt(cat.actualSpent)}</td>
                      <td className="ft-mono ft-text-muted">{fmt(cat.limitAmount)}</td>
                      <td><span className={`ft-badge ${over ? "ft-badge-over" : "ft-badge-ok"}`}>{over ? "⚠️ Over" : "✅ OK"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBER 10 — ADMIN CATEGORIES
═══════════════════════════════════════════════════════════════ */
function AdminCategoriesPage() {
  const [cats,    setCats]    = useState([]);
  const [form,    setForm]    = useState({ name: "", type: "EXPENSE" });
  const [err,     setErr]     = useState("");
  const [ok,      setOk]      = useState("");
  const [busy,    setBusy]    = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Http.get("/api/admin/categories").then(setCats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submit = async e => {
    e.preventDefault(); setErr(""); setOk(""); setBusy(true);
    try {
      await Http.post("/api/admin/category", form);
      setOk(`"${form.name}" added!`);
      setForm({ name: "", type: "EXPENSE" });
    } catch (e) {
      setErr("Failed.");
    } finally { setBusy(false); }
  };

  const income  = cats.filter(c => c.type === "INCOME");
  const expense = cats.filter(c => c.type === "EXPENSE");

  return (
    <div className="ft-fade-in">
      <SectionTitle sub="Create and view transaction categories">🗂️ Category Management</SectionTitle>
      <div className="ft-grid-2">
        <div className="ft-card">
          <h3 className="ft-card-heading">Add Category</h3>
          {err && <Alert>{err}</Alert>}
          {ok  && <Alert type="success">{ok}</Alert>}
          <form onSubmit={submit} className="ft-form">
            <div className="ft-field">
              <label className="ft-label">Name</label>
              <input className="ft-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Food, Salary, Transport" required />
            </div>
            <div className="ft-field">
              <label className="ft-label">Type</label>
              <div className="ft-type-toggle">
                <div className={`ft-type-opt ${form.type === "INCOME"  ? "income-active"  : ""}`} onClick={() => setForm({ ...form, type: "INCOME"  })}>📈 INCOME</div>
                <div className={`ft-type-opt ${form.type === "EXPENSE" ? "expense-active" : ""}`} onClick={() => setForm({ ...form, type: "EXPENSE" })}>📉 EXPENSE</div>
              </div>
            </div>
            <button className="ft-btn ft-btn-primary" disabled={busy}>{busy ? "Adding…" : "Add Category"}</button>
          </form>
        </div>
        <div className="ft-card">
          <h3 className="ft-card-heading">All Categories</h3>
          {loading ? <Spinner /> : (
            <>
              <div className="ft-cat-section">
                <div className="ft-cat-section-label ft-text-green">📈 INCOME</div>
                <div className="ft-tag-list">{income.map(c => <span key={c.id} className="ft-tag ft-tag-income">{c.name}</span>)}</div>
              </div>
              <div className="ft-cat-section">
                <div className="ft-cat-section-label ft-text-red">📉 EXPENSE</div>
                <div className="ft-tag-list">{expense.map(c => <span key={c.id} className="ft-tag ft-tag-expense">{c.name}</span>)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBER 10 — ADMIN USERS
═══════════════════════════════════════════════════════════════ */
function AdminUsersPage() {
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState("");
  const [roleF,   setRoleF]   = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Http.get("/api/admin/users").then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const roleMeta = {
    USER:    { bg: "#eff6ff", color: "#1d4ed8", icon: "👤" },
    ADVISOR: { bg: "#f5f3ff", color: "#6d28d9", icon: "📈" },
    ADMIN:   { bg: "#fff1f2", color: "#be123c", icon: "🛠️" },
  };
  const counts = {
    ALL:     users.length,
    USER:    users.filter(u => u.role === "USER").length,
    ADVISOR: users.filter(u => u.role === "ADVISOR").length,
    ADMIN:   users.filter(u => u.role === "ADMIN").length,
  };
  const filtered = users.filter(u =>
    (roleF === "ALL" || u.role === roleF) &&
    (u.username?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="ft-fade-in">
      <SectionTitle sub={`${users.length} registered users`}>👥 User Management</SectionTitle>
      <div className="ft-card">
        <div className="ft-user-controls">
          <input className="ft-input ft-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or email…" />
          <div className="ft-filter-row" style={{ marginBottom: 0 }}>
            {["ALL","USER","ADVISOR","ADMIN"].map(r => (
              <button key={r} className={`ft-btn ft-btn-sm ${roleF === r ? "ft-btn-primary" : "ft-btn-ghost"}`} onClick={() => setRoleF(r)}>
                {r} <span className="ft-count-badge">{counts[r]}</span>
              </button>
            ))}
          </div>
        </div>
        {loading ? <Spinner /> : filtered.length === 0 ? <Empty icon="👤" text="No users found." /> : (
          <table className="ft-table">
            <thead><tr><th>#</th><th>User</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              {filtered.map((u, i) => {
                const m = roleMeta[u.role] || roleMeta.USER;
                return (
                  <tr key={u.id}>
                    <td className="ft-mono ft-text-muted ft-text-sm">{i + 1}</td>
                    <td>
                      <div className="ft-user-cell">
                        <div className="ft-avatar ft-avatar-sm" style={{ background: m.bg, color: m.color }}>{u.username?.[0]?.toUpperCase()}</div>
                        <span className="ft-fw-600">{u.username}</span>
                      </div>
                    </td>
                    <td className="ft-text-muted">{u.email}</td>
                    <td><span className="ft-role-badge" style={{ background: m.bg, color: m.color }}>{m.icon} {u.role}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR + LAYOUT
═══════════════════════════════════════════════════════════════ */
const navConfig = {
  USER:    [{ key: "transactions", label: "Transactions",  icon: "📜" }, { key: "budget",  label: "Budget Planner",  icon: "📋" }, { key: "summary", label: "Monthly Summary", icon: "📊" }],
  ADVISOR: [{ key: "clients",      label: "My Clients",    icon: "📈" }],
  ADMIN:   [{ key: "categories",   label: "Categories",    icon: "🗂️" }, { key: "users",   label: "Users",           icon: "👥" }],
};

function Sidebar({ role, page, setPage }) {
  const nav = navConfig[role] || [];
  const roleColors = { USER: "#1e40af", ADVISOR: "#6d28d9", ADMIN: "#be123c" };
  const rc = roleColors[role] || "#1e40af";

  return (
    <div className="ft-sidebar">
      <div className="ft-sidebar-logo-area">
        <div className="ft-sidebar-logo">💰 FinTrack</div>
        <div className="ft-sidebar-user">
          <div className="ft-avatar ft-avatar-sm" style={{ background: `linear-gradient(135deg,${rc},${rc}99)`, color: "#fff" }}>
            {Auth.username()?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="ft-sidebar-username">{Auth.username()}</div>
            <span className="ft-sidebar-role-badge" style={{ background: rc + "22", color: rc }}>{role}</span>
          </div>
        </div>
      </div>
      <nav className="ft-sidebar-nav">
        {nav.map(n => (
          <button key={n.key} className={`ft-nav-link ${page === n.key ? "active" : ""}`} onClick={() => setPage(n.key)}>
            <span className="ft-nav-icon">{n.icon}</span> {n.label}
          </button>
        ))}
      </nav>
      <div className="ft-sidebar-footer">
        <button className="ft-nav-link ft-nav-link-danger" onClick={() => { Auth.logout(); window.location.reload(); }}>
          <span className="ft-nav-icon">🚪</span> Sign Out
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [authed,         setAuthed]         = useState(Auth.loggedIn());
  const [role,           setRole]           = useState(Auth.role());
  const [page,           setPage]           = useState(null);
  const [authView,       setAuthView]       = useState("login");
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    if (!page && role) {
      const defaults = { USER: "transactions", ADVISOR: "clients", ADMIN: "categories" };
      setPage(defaults[role] || "transactions");
    }
  }, [role, page]);

  const handleLogin = r => { setAuthed(true); setRole(r); };

  if (!authed) {
    return authView === "login"
      ? <LoginPage onLogin={handleLogin} goRegister={() => setAuthView("register")} />
      : <RegistrationPage goLogin={() => setAuthView("login")} />;
  }

  const handleSetPage = p => { setPage(p); setSelectedClient(null); };

  let content = null;
  if (role === "USER") {
    if (page === "transactions") content = <TransactionsPage />;
    if (page === "budget")       content = <BudgetSetupPage />;
    if (page === "summary")      content = <MonthlySummaryPage />;
  }
  if (role === "ADVISOR") {
    if (page === "clients") {
      content = selectedClient
        ? <AdvisorClientPage client={selectedClient} onBack={() => setSelectedClient(null)} />
        : <AdvisorClientListPage onSelect={setSelectedClient} />;
    }
  }
  if (role === "ADMIN") {
    if (page === "categories") content = <AdminCategoriesPage />;
    if (page === "users")      content = <AdminUsersPage />;
  }

  return (
    <>
      <Sidebar role={role} page={page} setPage={handleSetPage} />
      <main className="ft-main">{content}</main>
    </>
  );
}