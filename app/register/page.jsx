"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RANKS = ["Rookie", "Veteran", "Elite", "Pro", "Master", "Grandmaster", "Legendary"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    codmName: "", codmId: "", rank: "Rookie", level: "",
    gender: "Male"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    localStorage.setItem("codm_user", JSON.stringify(data.user));
    router.push("/feed");
  }

  const labelStyle = {
    display: "block", fontSize: "0.78rem", color: "var(--text-muted)",
    marginBottom: "0.3rem", fontWeight: 500,
  };
  const sectionTitle = {
    fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "0.95rem",
    color: "#f97316", letterSpacing: "0.06em", textTransform: "uppercase",
    marginBottom: "0.75rem", marginTop: "0.5rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem 1.25rem",
        background: "radial-gradient(ellipse at top, rgba(249, 115, 22, 0.1) 0%, var(--bg-deep) 60%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔥</div>
        <h1
          style={{
            fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
            fontSize: "2rem", color: "var(--text-main)", letterSpacing: "0.05em",
          }}
        >
          Join CODM LK
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Set up your player profile
        </p>
      </div>

      <div className="glass-card" style={{ width: "100%", maxWidth: "520px", padding: "2rem" }}>
        {error && (
          <div
            style={{
              background: "#7f1d1d30", border: "1px solid #ef444450",
              borderRadius: "8px", padding: "0.625rem 0.875rem",
              color: "#fca5a5", fontSize: "0.875rem", marginBottom: "1.25rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {/* Account info */}
          <p style={sectionTitle}>Account Info</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input className="input-field" name="name" placeholder="Your name" required value={form.name} onChange={handleChange} id="reg-name" />
            </div>
            <div>
              <label style={labelStyle}>Gender</label>
              <select className="input-field" name="gender" value={form.gender} onChange={handleChange} id="reg-gender"
                style={{ cursor: "pointer" }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input className="input-field" type="email" name="email" placeholder="your@email.com" required value={form.email} onChange={handleChange} id="reg-email" />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input className="input-field" type="password" name="password" placeholder="••••••••" required minLength={6} value={form.password} onChange={handleChange} id="reg-password" />
          </div>

          {/* CODM info */}
          <p style={{ ...sectionTitle, marginTop: "1rem" }}>CODM Identity</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>CODM Name</label>
              <input className="input-field" name="codmName" placeholder="In-game name" required value={form.codmName} onChange={handleChange} id="reg-codmname" />
            </div>
            <div>
              <label style={labelStyle}>CODM ID</label>
              <input className="input-field" name="codmId" placeholder="e.g. 12345678" value={form.codmId} onChange={handleChange} id="reg-codmid" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Rank</label>
              <select className="input-field" name="rank" value={form.rank} onChange={handleChange} id="reg-rank" style={{ cursor: "pointer" }}>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Level</label>
              <input className="input-field" type="number" name="level" placeholder="e.g. 150" min={1} max={999} value={form.level} onChange={handleChange} id="reg-level" />
            </div>
          </div>



          <button
            type="submit" className="btn-ember"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
            id="reg-submit"
          >
            {loading ? "Creating profile..." : "Create Profile 🔥"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link href="/" style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
