"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";

export default function SavedPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("codm_user");
    if (!u) { router.push("/"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    fetch(`/api/saved/${parsed.id}`)
      .then(r => r.json())
      .then(data => { setPosts(data.savedPosts || []); setLoading(false); });
  }, []);

  return (
    <>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>
          🔖 Saved Posts
        </h1>
        {loading && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "3rem" }}>Loading…</p>}
        {!loading && posts.length === 0 && (
          <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔖</p>
            <p style={{ color: "var(--text-muted)" }}>No saved posts yet.</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>Tap the Save button on any post to save it here.</p>
          </div>
        )}
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={{ ...post, codmName: post.authorName, userRank: post.authorRank, userAvatar: post.authorAvatar }}
            currentUser={user}
            savedPostIds={user?.savedPosts || []}
          />
        ))}
      </div>
    </>
  );
}
