"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    localStorage.setItem("codm_user", JSON.stringify(data.user));
    router.push("/feed");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
        background: "radial-gradient(ellipse at top, rgba(249, 115, 22, 0.1) 0%, var(--bg-deep) 50%)",
      }}
    >
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img src="/logo.png" alt="CODM LK" style={{ width: 180, height: "auto", marginBottom: "1rem", display: "block" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "340px", margin: "0 auto", textAlign: "center" }}>
          Sri Lanka's Call of Duty Mobile community. Connect with players, share your game.
        </p>
      </div>

      {/* Login card */}
      <div className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "2rem" }}>
        <h2
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "var(--text-main)",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          Welcome Back
        </h2>

        {error && (
          <div
            style={{
              background: "#7f1d1d30",
              border: "1px solid #ef444450",
              borderRadius: "8px",
              padding: "0.625rem 0.875rem",
              color: "#fca5a5",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.375rem", fontWeight: 500 }}>
              Email
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.375rem", fontWeight: 500 }}>
              Password
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />
          </div>

          <button
            type="submit"
            className="btn-ember"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            id="login-submit"
          >
            {loading ? "Logging in..." : "Login 🔥"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          No account?{" "}
          <Link
            href="/register"
            style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}
          >
            Register here
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p style={{ marginTop: "2rem", color: "var(--text-muted)", fontSize: "0.75rem", opacity: 0.8 }}>
        🇱🇰 For Sri Lankan CODM players
      </p>
    </div>
  );
}
