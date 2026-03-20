"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";
import SaveButton from "./SaveButton";

function BigFireAnimation() {
  return (
    <div style={{
      position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
      fontSize: "6rem", zIndex: 10, animation: "pop-in-out 1s ease-out forwards",
      pointerEvents: "none", textShadow: "0 0 20px rgba(249,115,22,0.8)"
    }}>
      🔥
    </div>
  );
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function RankBadge({ rank }) {
  const cls = rank ? `rank-${rank.toLowerCase()}` : "rank-rookie";
  return (
    <span className={cls} style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", border: `1px solid currentColor`, borderRadius: 20 }}>
      {rank || "Rookie"}
    </span>
  );
}

function PostMenu({ post, currentUser, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!currentUser || currentUser.id !== post.userId) return null;

  return (
    <div className="post-menu-wrap" ref={ref}>
      <button className="post-menu-btn" onClick={() => setOpen(v => !v)} title="Options">⋮</button>
      {open && (
        <div className="post-menu-dropdown">
          <button className="post-menu-item" onClick={() => { setOpen(false); onEdit(); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button className="post-menu-item danger" onClick={() => { setOpen(false); onDelete(); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function PostCard({ post: initialPost, currentUser, savedPostIds = [] }) {
  const [post, setPost] = useState(initialPost);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(initialPost.content);
  const [saving, setSaving] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showBigFire, setShowBigFire] = useState(false);
  
  const [editImage, setEditImage] = useState(initialPost.imageUrl);
  const [editError, setEditError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileRef = useRef(null);

  if (deleted) return null;

  const handleDoubleTap = () => {
    const btn = document.getElementById(`like-btn-${post.id}`);
    if (btn) btn.click();
    setShowBigFire(true);
    setTimeout(() => setShowBigFire(false), 1000);
  };

  function handleEditImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setEditError("Image too large (max 3MB)"); return; }
    setEditError("");
    const reader = new FileReader();
    reader.onload = (ev) => setEditImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleEdit() {
    if (!editContent.trim() || saving) return;
    setSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, content: editContent, imageUrl: editImage }),
      });
      const data = await res.json();
      if (data.success) {
        setPost(prev => ({ ...prev, content: editContent, imageUrl: editImage !== undefined ? editImage : prev.imageUrl, edited: true }));
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id }),
    });
    const data = await res.json();
    if (data.success) setDeleted(true);
    setSaving(false);
  }

  return (
    <div className="glass-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Link href={`/profile/${post.userId}`} style={{ textDecoration: "none" }}>
          <div style={{ position: "relative" }}>
            <div className="avatar-circle-sm" style={{ width: 40, height: 40, fontSize: "1rem" }}>
              {post.userAvatar
                ? <img src={post.userAvatar} alt={post.codmName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : post.codmName?.[0]?.toUpperCase()
              }
            </div>
            {/* Active Dot */}
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, background: "#22c55e", borderRadius: "50%", border: "2px solid var(--bg-card)" }} title="Active now" />
          </div>
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={`/profile/${post.userId}`} style={{ textDecoration: "none" }}>
              <span style={{ fontWeight: 700, color: "var(--ember)", fontSize: "0.95rem", fontFamily: "Rajdhani, sans-serif" }}>
                {post.codmName}
              </span>
            </Link>
            {post.userGender === "Male" && <span style={{ color: "#3b82f6", fontSize: "0.85rem", lineHeight: 1 }}>♂️</span>}
            {post.userGender === "Female" && <span style={{ color: "#ec4899", fontSize: "0.85rem", lineHeight: 1 }}>♀️</span>}
            <RankBadge rank={post.userRank} />
            {post.edited && <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>(edited)</span>}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{timeAgo(post.createdAt)}</div>
        </div>
        <PostMenu post={post} currentUser={currentUser} onEdit={() => { setEditing(true); setEditContent(post.content); setEditImage(post.imageUrl); setEditError(""); }} onDelete={() => setShowDeleteConfirm(true)} />
      </div>

      {/* Content */}
      {editing ? (
        <div style={{ marginBottom: 12 }}>
          <textarea
            className="input-field"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            maxLength={500}
            autoFocus
          />
          
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            {editImage ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={editImage} alt="Edit preview" style={{ width: "100%", borderRadius: 8, maxHeight: 200, objectFit: "cover", display: "block" }} />
                <button type="button" onClick={() => setEditImage(null)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.7)", color: "white", width: 26, height: 26, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>✕</button>
              </div>
            ) : (
              <div>
                <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()} style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>📷 Add / Change Image</button>
                <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleEditImage} />
              </div>
            )}
          </div>
          {editError && <div style={{ color: "#fca5a5", fontSize: "0.8rem", marginBottom: 8 }}>{editError}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn-ember" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }} onClick={handleEdit} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button className="btn-ghost" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }} onClick={() => { setEditing(false); setEditImage(post.imageUrl); setEditError(""); }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: "var(--text-main)", lineHeight: 1.6, marginBottom: post.imageUrl ? 12 : 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {post.content}
        </p>
      )}

      {post.imageUrl && (
        <div style={{ position: "relative", marginBottom: 4, marginTop: editing ? 8 : 0 }} onDoubleClick={handleDoubleTap}>
          <img
            src={post.imageUrl}
            alt="Post image"
            style={{ width: "100%", borderRadius: 8, maxHeight: 400, objectFit: "cover", display: "block" }}
          />
          {showBigFire && <BigFireAnimation />}
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <LikeButton
          postId={post.id}
          initialFires={post.fires || 0}
          initialLikedBy={post.likedBy || []}
          currentUserId={currentUser?.id}
        />

        <button
          className="save-btn"
          onClick={() => setShowComments(v => !v)}
          style={{ gap: 5 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {post.comments?.length || 0}
        </button>

        {currentUser && (
          <SaveButton
            postId={post.id}
            currentUserId={currentUser.id}
            savedPostIds={savedPostIds}
          />
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={post.comments || []}
          currentUser={currentUser}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="glass-card" style={{ padding: "1.5rem", width: "90%", maxWidth: 320, textAlign: "center", background: "var(--bg-card)", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
            <h3 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text-main)" }}>Delete Post?</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-ghost" style={{ flex: 1, padding: "0.5rem" }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-ember" style={{ flex: 1, padding: "0.5rem", background: "linear-gradient(135deg, #ef4444, #b91c1c)" }} onClick={handleDelete} disabled={saving}>
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
