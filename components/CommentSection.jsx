"use client";
import { useState } from "react";

export default function CommentSection({ postId, comments: initialComments = [], currentUser }) {
  const [comments, setComments] = useState(initialComments);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editInput, setEditInput] = useState("");

  async function submitComment(e) {
    e.preventDefault();
    if (!input.trim() || !currentUser || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: currentUser.id, text: input.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.comment]);
        setInput("");
        setExpanded(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit(commentId) {
    if (!editInput.trim() || !currentUser || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, commentId, userId: currentUser.id, text: editInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, text: editInput.trim() } : c));
        setEditingCommentId(null);
        setEditInput("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    if (!confirm("Delete this comment?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/comments?postId=${postId}&commentId=${commentId}&userId=${currentUser.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const PREVIEW = 2;
  const shown = expanded ? comments : comments.slice(-PREVIEW);

  function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="comment-section">
      {comments.length > PREVIEW && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", marginBottom: 6 }}
        >
          View all {comments.length} comments
        </button>
      )}
      {expanded && comments.length > PREVIEW && (
        <button
          onClick={() => setExpanded(false)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", marginBottom: 6 }}
        >
          Hide comments
        </button>
      )}

      {shown.map((c) => (
        <div key={c.id} className="comment-item" style={{ flexDirection: "column" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <div className="comment-avatar">
              {c.avatar
                ? <img src={c.avatar} alt={c.codmName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : c.codmName?.[0]?.toUpperCase()
              }
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ color: "var(--ember)", fontSize: "0.8rem", fontWeight: 700, marginRight: 6 }}>{c.codmName}</span>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>{timeAgo(c.createdAt)}</div>
                </div>
                {currentUser?.id === c.userId && !editingCommentId && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => { setEditingCommentId(c.id); setEditInput(c.text); }} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.7rem", cursor: "pointer" }}>Edit</button>
                    <button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.7rem", cursor: "pointer" }}>Delete</button>
                  </div>
                )}
              </div>
              
              {editingCommentId === c.id ? (
                <div style={{ marginTop: "6px", display: "flex", gap: "6px", flexDirection: "column" }}>
                  <input
                    className="comment-input"
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    maxLength={300}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: "8px", alignSelf: "flex-end", marginTop: "4px" }}>
                    <button onClick={() => setEditingCommentId(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.75rem", cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => handleSaveEdit(c.id)} disabled={!editInput.trim() || submitting} style={{ background: "none", border: "none", color: "var(--ember)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Save</button>
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: "0.85rem", color: "#e2e8f0", marginTop: 4, wordBreak: "break-word" }}>{c.text}</span>
              )}
            </div>
          </div>
        </div>
      ))}

      {currentUser && (
        <form onSubmit={submitComment} className="comment-input-wrap">
          <div className="comment-avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>
            {currentUser.avatar
              ? <img src={currentUser.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : currentUser.codmName?.[0]?.toUpperCase()
            }
          </div>
          <input
            className="comment-input"
            placeholder="Add a comment..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
          />
          <button
            type="submit"
            disabled={!input.trim() || submitting}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: input.trim() ? "var(--ember)" : "var(--text-muted)",
              fontWeight: 700, fontSize: "0.85rem", padding: "0 4px",
              transition: "color 0.2s"
            }}
          >
            Post
          </button>
        </form>
      )}

      {!currentUser && comments.length === 0 && (
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No comments yet.</p>
      )}
    </div>
  );
}
