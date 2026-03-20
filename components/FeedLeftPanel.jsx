"use client";
import Link from "next/link";

export default function FeedLeftPanel({ currentUser }) {
  return (
    <div className="desktop-panel" style={{ width: 260, position: "sticky", top: "80px", flexShrink: 0 }}>
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {currentUser && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div className="avatar-circle-sm" style={{ width: 44, height: 44, fontSize: "1.1rem" }}>
              {currentUser.avatar
                ? <img src={currentUser.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : currentUser.codmName?.[0]?.toUpperCase()
              }
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontFamily: "Rajdhani, sans-serif", fontSize: "1.05rem", color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {currentUser.codmName}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                ID: {currentUser.codmId}
              </div>
            </div>
          </div>
        )}

        <Link href="/messages" style={{ width: "100%", textDecoration: "none" }}>
          <button 
            className="btn-ember" 
            style={{ width: "100%", justifyContent: "center" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Inbox
          </button>
        </Link>

        <hr style={{ borderColor: "var(--border)", margin: "0.5rem 0" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link href={`/profile/${currentUser?.id}`} style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ width: "100%", justifyContent: "flex-start", border: "none" }}>
              👤 My Profile
            </button>
          </Link>
          <Link href="/saved" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ width: "100%", justifyContent: "flex-start", border: "none" }}>
              🔖 Saved Posts
            </button>
          </Link>
          <Link href="/settings" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ width: "100%", justifyContent: "flex-start", border: "none" }}>
              ⚙️ Settings
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
