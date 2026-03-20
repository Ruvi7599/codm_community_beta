"use client";
import { useState } from "react";

export default function FireButton({ postId, initialFires }) {
  const [fires, setFires] = useState(initialFires || 0);
  const [animating, setAnimating] = useState(false);
  const [fired, setFired] = useState(false);

  async function handleFire() {
    if (fired) return; // one fire per session per post
    setAnimating(true);
    setFired(true);

    // Optimistic update
    setFires((prev) => prev + 1);

    await fetch("/api/fire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });

    setTimeout(() => setAnimating(false), 600);
  }

  return (
    <button
      onClick={handleFire}
      disabled={fired}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.45rem 0.9rem",
        background: fired
          ? "rgba(249,115,22,0.15)"
          : "rgba(249,115,22,0.08)",
        border: `1px solid ${fired ? "#f97316" : "#3a3d4a"}`,
        borderRadius: "20px",
        color: fired ? "#f97316" : "#8892a4",
        cursor: fired ? "default" : "pointer",
        fontSize: "0.875rem",
        fontWeight: 600,
        transition: "all 0.2s",
        boxShadow: fired ? "0 0 12px rgba(249,115,22,0.25)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!fired) {
          e.currentTarget.style.borderColor = "#f97316";
          e.currentTarget.style.color = "#f97316";
          e.currentTarget.style.background = "rgba(249,115,22,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (!fired) {
          e.currentTarget.style.borderColor = "#3a3d4a";
          e.currentTarget.style.color = "#8892a4";
          e.currentTarget.style.background = "rgba(249,115,22,0.08)";
        }
      }}
    >
      <span
        style={{
          fontSize: "1.1rem",
          display: "inline-block",
          transform: animating ? "scale(1.4) rotate(-10deg)" : "scale(1)",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        🔥
      </span>
      <span>{fires}</span>
    </button>
  );
}
