"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import SocialIcons from "@/components/SocialIcons";

function RankBadge({ rank }) {
  const cls = rank ? `rank-${rank.toLowerCase()}` : "rank-rookie";
  return (
    <span className={cls} style={{ fontSize: "0.85rem", fontWeight: 700, padding: "2px 10px", border: `1px solid currentColor`, borderRadius: 20 }}>
      {rank || "Rookie"}
    </span>
  );
}

export default function ProfilePage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const profileId = resolvedParams.userId;

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("codm_user");
    if (u) setCurrentUser(JSON.parse(u));

    fetch(`/api/profile/${profileId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setProfile(null);
          setLoading(false);
          return;
        }
        setProfile(data.user);
        setPosts(data.posts || []);
        setLoading(false);
      });
  }, [profileId, router]);

  if (loading) {
    return (
      <>
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Loading…</div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--ember)", fontFamily: "Rajdhani, sans-serif", fontSize: "1.5rem" }}>
          User not found.
          <br/>
          <Link href="/feed" style={{ color: "var(--text-main)", fontSize: "1rem", textDecoration: "underline", marginTop: "1rem", display: "inline-block" }}>Back to Feed</Link>
        </div>
      </>
    );
  }

  const isOwnProfile = currentUser?.id === profileId;

  const handleDeleteProfile = async () => {
    if (deleteInput !== "DELETE" || deleting) return;
    setDeleting(true);
    const res = await fetch(`/api/profile/${profileId}`, { method: "DELETE" });
    if (res.ok) {
      localStorage.removeItem("codm_user");
      router.push("/");
      router.refresh();
    } else {
      setDeleting(false);
    }
  };

  return (
    <>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem" }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div className="avatar-circle" style={{ width: 80, height: 80, fontSize: "2rem" }}>
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.codmName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : profile.codmName?.[0]?.toUpperCase()
              }
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "2rem", fontWeight: 700, margin: 0, lineHeight: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="gradient-text">{profile.codmName}</span>
                {profile.gender?.toLowerCase() === "male" && <span style={{ color: "#3b82f6", fontSize: "1.4rem", marginTop: "2px" }} title="Male">♂️</span>}
                {profile.gender?.toLowerCase() === "female" && <span style={{ color: "#ec4899", fontSize: "1.4rem", marginTop: "2px" }} title="Female">♀️</span>}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                <RankBadge rank={profile.rank} />
                <span style={{ fontSize: "0.85rem", color: "var(--text-main)", background: "var(--bg-surface)", padding: "2px 10px", borderRadius: 20, border: "1px solid var(--border)" }}>
                  Lvl {profile.level || "0"}
                </span>
                
                <div style={{ display: "inline-flex", alignItems: "center", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "4px 8px", userSelect: "all" }}>
                    ID: {profile.codmId}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(profile.codmId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    style={{ 
                      background: "var(--bg-surface)", border: "none", borderLeft: "1px solid var(--border)", 
                      padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      color: copied ? "#22c55e" : "var(--text-main)"
                    }}
                    title="Copy ID"
                  >
                    {copied ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {isOwnProfile ? (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link href="/settings" style={{ textDecoration: "none" }}>
                  <button className="btn-ghost" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, display: "inline-block", verticalAlign: "-2px" }}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Profile
                  </button>
                </Link>
                <button onClick={() => setShowDeleteConfirm(true)} className="btn-ghost" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", color: "#ef4444", borderColor: "#ef444450" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, display: "inline-block", verticalAlign: "-2px" }}>
                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                  </svg>
                  Delete Profile
                </button>
              </div>
            ) : (
              <Link href={`/messages?u=${profile.id}`} style={{ textDecoration: "none" }}>
                <button className="btn-ember" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, display: "inline-block", verticalAlign: "-2px" }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Message
                </button>
              </Link>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            {profile.bio ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.5 }}>{profile.bio}</p>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>No bio yet.</p>
            )}

            {/* Social Links */}
            <SocialIcons socialLinks={profile.socialLinks || {}} />
          </div>
        </div>

        {/* User Posts */}
        <h2 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
          Posts by {profile.codmName}
        </h2>

        {posts.length === 0 ? (
          <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
            No posts yet.
          </div>
        ) : (
          posts.map((p) => (
            <PostCard
              key={p.id}
              post={{ ...p, userName: profile.name, codmName: profile.codmName, userRank: profile.rank, userAvatar: profile.avatar, userGender: profile.gender }}
              currentUser={currentUser}
              savedPostIds={currentUser?.savedPosts || []}
            />
          ))
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div className="glass-card" style={{ padding: "2rem", width: "90%", maxWidth: 400, textAlign: "center", background: "var(--bg-card)", boxShadow: "0 10px 40px rgba(0,0,0,0.6)", borderRadius: 16 }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⚠️</div>
              <h3 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text-main)" }}>Delete Profile</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                This is permanent. It will instantly delete your account, all your posts, your comments, and all of your messages. 
              </p>
              
              <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={deleteInput} 
                  onChange={e => setDeleteInput(e.target.value)} 
                  placeholder="DELETE"
                  style={{ width: "100%", padding: "0.6rem 0.8rem", fontSize: "0.9rem", textAlign: "center" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button className="btn-ghost" style={{ flex: 1, padding: "0.6rem" }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button 
                  className="btn-ember" 
                  style={{ flex: 1, padding: "0.6rem", background: deleteInput === "DELETE" ? "linear-gradient(135deg, #ef4444, #b91c1c)" : "#3a3f50", opacity: deleteInput === "DELETE" ? 1 : 0.5, cursor: deleteInput === "DELETE" ? "pointer" : "not-allowed" }} 
                  onClick={handleDeleteProfile} 
                  disabled={deleting || deleteInput !== "DELETE"}
                >
                  {deleting ? "Deleting..." : "Delete All"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
