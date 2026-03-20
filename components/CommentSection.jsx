"use client";
import { useState } from "react";

export default function CommentSection({ postId, comments: initialComments = [], currentUser }) {
  const [comments, setComments] = useState(initialComments);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        <div key={c.id} className="comment-item">
          <div className="comment-avatar">
            {c.avatar
              ? <img src={c.avatar} alt={c.codmName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : c.codmName?.[0]?.toUpperCase()
            }
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ color: "var(--ember)", fontSize: "0.8rem", fontWeight: 700, marginRight: 6 }}>{c.codmName}</span>
            <span style={{ fontSize: "0.8rem", color: "#d1d5db" }}>{c.text}</span>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>{timeAgo(c.createdAt)}</div>
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
