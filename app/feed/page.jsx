"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import FeedLeftPanel from "@/components/FeedLeftPanel";
import FeedRightPanel from "@/components/FeedRightPanel";
import { appCache } from "@/lib/cache";

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(appCache.feedPosts || []);
  const [loading, setLoading] = useState(!appCache.feedPosts);

  const [page, setPage] = useState(appCache.feedPage || 1);
  const [hasMore, setHasMore] = useState(appCache.feedHasMore ?? true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("codm_user");
    if (!u) { router.push("/"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    if (!appCache.feedPosts) {
      loadPosts(1, false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPosts(nextPage, true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, loadingMore, hasMore, page]);

  async function loadPosts(pageToLoad = 1, isAppending = false) {
    if (!isAppending) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/posts?page=${pageToLoad}`);
      const data = await res.json();
      
      if (data.posts) {
        setPosts(prev => {
          const newPosts = isAppending ? [...prev, ...data.posts] : data.posts;
          appCache.feedPosts = newPosts;
          return newPosts;
        });
        setHasMore(data.hasMore);
        appCache.feedHasMore = data.hasMore;
        appCache.feedPage = pageToLoad;
      } else {
        setPosts(data);
        setHasMore(false);
        appCache.feedPosts = data;
        appCache.feedHasMore = false;
        appCache.feedPage = 1;
      }
    } finally {
      if (!isAppending) setLoading(false);
      else setLoadingMore(false);
    }
  }

  return (
    <>
      <div className="feed-container" style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem", display: "flex", gap: "2rem", alignItems: "flex-start", justifyContent: "center" }}>
        <FeedLeftPanel currentUser={user} />
        
        <div className="feed-main" style={{ flex: 1, maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
              Community Feed 🔥
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Latest from Sri Lanka's CODM players</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={loadPosts} className="btn-ghost" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }} title="Refresh">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <Link href="/create-post">
              <button className="btn-ember" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>+ Post</button>
            </Link>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading…</div>
        )}

        {!loading && posts.length === 0 && (
          <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎮</p>
            <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>No posts yet</p>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Be the first to post something!</p>
            <Link href="/create-post">
              <button className="btn-ember">Create First Post 🔥</button>
            </Link>
          </div>
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            savedPostIds={user?.savedPosts || []}
          />
        ))}
        </div>

        <FeedRightPanel />
      </div>
    </>
  );
}
