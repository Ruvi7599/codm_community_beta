"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { appCache } from "@/lib/cache";

function formatLastSeen(lastActive) {
  const diffMs = Date.now() - lastActive;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(lastActive).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function FeedRightPanel() {
  const [users, setUsers] = useState(appCache.activeUsers || []);
  const [loading, setLoading] = useState(!appCache.activeUsers);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = () => {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => {
          setUsers(data);
          appCache.activeUsers = data;
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    if (!appCache.activeUsers) fetchUsers();
    const iv = setInterval(fetchUsers, 30000); // refresh every 30s
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="desktop-panel" style={{ width: 280, position: "sticky", top: "80px", flexShrink: 0 }}>
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.75rem", color: "var(--text-main)" }}>
          Active Members <span style={{ color: "#22c55e", fontSize: "1rem" }}>●</span>
        </h3>

        <input 
          type="text" 
          placeholder="Search by Name or ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
          style={{ width: "100%", padding: "0.5rem 0.8rem", fontSize: "0.85rem", borderRadius: "8px", marginBottom: "1rem" }}
        />

        {loading ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "1rem 0" }}>Loading...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
            {users.filter(u => u && (
              u.codmName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              String(u.id).toLowerCase().includes(searchQuery.toLowerCase())
            )).map(u => {
              const isOnline = u.lastActive && (Date.now() - u.lastActive < 300000);
              const lastSeenText = u.lastActive ? formatLastSeen(u.lastActive) : null;
              return (
                <Link key={u.id} href={`/profile/${u.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "6px", borderRadius: "8px", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--bg-surface)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div className="avatar-circle-sm" style={{ width: 36, height: 36, fontSize: "0.9rem" }}>
                        {u.avatar
                          ? <img src={u.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : u.codmName?.[0]?.toUpperCase()
                        }
                      </div>
                      {isOnline && (
                        <div style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, background: "#22c55e", borderRadius: "50%", border: "2px solid var(--bg-card)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                        {u.codmName}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: isOnline ? "#22c55e" : "var(--text-muted)" }}>
                        {isOnline
                          ? "Active now"
                          : lastSeenText !== null
                            ? `Last seen ${lastSeenText}`
                            : u.rank
                        }
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
